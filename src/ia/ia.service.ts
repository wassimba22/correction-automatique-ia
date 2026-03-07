import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

type NormalizedEvaluation = {
  correction: string;
  note: number;
  commentaire: string;
};

type CachedEvaluation = {
  value: Record<string, unknown>;
  expiresAt: number;
};

@Injectable()
export class IaService {
  private readonly cacheTtlMs = 5 * 60 * 1000;
  private readonly cache = new Map<string, CachedEvaluation>();
  private readonly inFlight = new Map<string, Promise<Record<string, unknown>>>();

  async evaluateText(text: string) {
    return this.analyserTexte(text);
  }

  async analyserTexte(text: string) {
    const cacheKey = this.buildCacheKey(text);
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const existingInFlight = this.inFlight.get(cacheKey);
    if (existingInFlight) {
      return existingInFlight;
    }

    const promise = this.runAnalysis(text, cacheKey);
    this.inFlight.set(cacheKey, promise);

    try {
      return await promise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  private async runAnalysis(
    text: string,
    cacheKey: string,
  ): Promise<Record<string, unknown>> {
    const prompt = `
Tu es un professeur.

Corrige le texte suivant et donne :

1- la version corrigee
2- une note sur 20
3- un commentaire pedagogique

Texte:
${text}

Reponds UNIQUEMENT en JSON valide comme ceci :

{
  "correction": "...",
  "note": 15,
  "commentaire": "..."
}
Ne renvoie aucune phrase avant ou apres le JSON.
`;

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Missing HUGGINGFACE_API_TOKEN');
      }

      const rawFirst = await this.callModel(token, prompt);
      const firstCandidate = this.extractJson(rawFirst);
      const firstNormalized = this.normalizeEvaluation(firstCandidate);
      if (firstNormalized) {
        const value = this.toServiceShape(firstNormalized);
        this.setCached(cacheKey, value);
        return value;
      }

      // Retry once with a repair prompt when output is not valid JSON.
      const repairPrompt =
        'Reponds UNIQUEMENT avec un JSON valide ayant exactement les cles correction, note, commentaire.';
      const rawSecond = await this.callModel(token, `${prompt}\n\n${repairPrompt}`);
      const secondCandidate = this.extractJson(rawSecond);
      const secondNormalized = this.normalizeEvaluation(secondCandidate);
      if (secondNormalized) {
        const value = this.toServiceShape(secondNormalized);
        this.setCached(cacheKey, value);
        return value;
      }

      throw new Error('Model returned invalid JSON format');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown IA error';

      // Fallback local to keep the submission/text flow working if HF is unavailable.
      return {
        contenuCorrige: this.basicCorrection(text),
        explication: `Correction locale appliquee (service IA externe indisponible): ${errorMessage}`,
        noteIA: 10,
        commentaireAuto: `Texte corrige localement. Cause: ${errorMessage}`,
      };
    }
  }

  private buildCacheKey(text: string): string {
    return text.trim();
  }

  private getCached(key: string): Record<string, unknown> | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  private setCached(key: string, value: Record<string, unknown>): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private basicCorrection(text: string): string {
    return text
      .replace(/\bje suis aller\b/gi, 'je suis alle')
      .replace(/\bj'ai prend\b/gi, "j'ai pris")
      .replace(/\bdes science\b/gi, 'des sciences')
      .trim();
  }

  private async callModel(token: string, prompt: string): Promise<string> {
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.1-8B-Instruct:cheapest',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 180,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 70000,
      },
    );

    const content =
      response.data?.choices?.[0]?.message?.content ??
      response.data?.choices?.[0]?.text;

    if (typeof content === 'string' && content.trim().length > 0) {
      return content;
    }

    throw new Error('Empty model content');
  }

  private extractJson(content: string): Record<string, unknown> | null {
    const fenced = content.match(/```json\s*([\s\S]*?)```/i);
    const raw = fenced?.[1]?.trim() ?? this.extractJsonObject(content) ?? content.trim();

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }

  private extractJsonObject(content: string): string | null {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return content.slice(start, end + 1).trim();
    }
    return null;
  }

  private normalizeEvaluation(data: Record<string, unknown> | null): NormalizedEvaluation | null {
    if (!data) {
      return null;
    }

    const correction = this.pickString(data.correction, data.contenuCorrige);
    const commentaire = this.pickString(
      data.commentaire,
      data.commentaireAuto,
      data.explication,
    );
    const note = this.parseAndClampNote(data.note ?? data.noteIA ?? data.grade);

    if (!correction || !commentaire || note === null) {
      return null;
    }

    return {
      correction,
      note,
      commentaire,
    };
  }

  private parseAndClampNote(value: unknown): number | null {
    const note =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value.replace(',', '.'))
          : NaN;

    if (Number.isNaN(note)) {
      return null;
    }

    if (note < 0) {
      return 0;
    }
    if (note > 20) {
      return 20;
    }
    return note;
  }

  private pickString(...values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return null;
  }

  private toServiceShape(evalResult: NormalizedEvaluation): Record<string, unknown> {
    return {
      correction: evalResult.correction,
      note: evalResult.note,
      commentaire: evalResult.commentaire,
      contenuCorrige: evalResult.correction,
      noteIA: evalResult.note,
      commentaireAuto: evalResult.commentaire,
      explication: evalResult.commentaire,
    };
  }

  private getToken(): string | null {
    const fromEnv = process.env.HUGGINGFACE_API_TOKEN?.trim();
    if (fromEnv) {
      return fromEnv;
    }

    const candidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'backend/api/.env'),
      path.resolve(__dirname, '../../.env'),
    ];

    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const line = content
        .split(/\r?\n/)
        .find((row) => row.startsWith('HUGGINGFACE_API_TOKEN='));

      if (!line) {
        continue;
      }

      const value = line.split('=')[1]?.trim();
      if (value) {
        return value;
      }
    }

    return null;
  }
}
