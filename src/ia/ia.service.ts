import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PromptBuilder } from './prompt-builder';
import { NormalizedEvaluation, ResponseParser } from './response-parser';

type CachedEvaluation = {
  value: Record<string, unknown>;
  expiresAt: number;
};

@Injectable()
export class IaService {
  private readonly cacheTtlMs = 5 * 60 * 1000;
  private readonly primaryModel = 'meta-llama/Llama-3.1-8B-Instruct:cheapest';
  private readonly secondaryModel = 'Qwen/Qwen3.5-27B:cheapest';
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
    const prompt = PromptBuilder.buildEvaluationPrompt(text);

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Missing HUGGINGFACE_API_TOKEN');
      }

      const normalized = await this.tryResolveEvaluation(token, prompt);
      if (normalized) {
        const value = ResponseParser.toServiceShape(normalized);
        this.setCached(cacheKey, value);
        return value;
      }

      throw new Error('Model returned invalid JSON format after retries');
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

  private async tryResolveEvaluation(
    token: string,
    basePrompt: string,
  ): Promise<NormalizedEvaluation | null> {
    const strictRepairPrompt = PromptBuilder.strictRepairPrompt();
    const hardRepairPrompt = PromptBuilder.hardRepairPrompt();

    const attempts: Array<{ model: string; prompt: string }> = [
      { model: this.primaryModel, prompt: basePrompt },
      { model: this.primaryModel, prompt: `${basePrompt}\n\n${strictRepairPrompt}` },
      { model: this.primaryModel, prompt: `${basePrompt}\n\n${strictRepairPrompt}\n${hardRepairPrompt}` },
      { model: this.secondaryModel, prompt: basePrompt },
      { model: this.secondaryModel, prompt: `${basePrompt}\n\n${strictRepairPrompt}` },
    ];

    for (const attempt of attempts) {
      try {
        const raw = await this.callModel(token, attempt.prompt, attempt.model);
        const candidate = ResponseParser.extractJson(raw);
        const normalized = ResponseParser.normalizeEvaluation(candidate);
        if (normalized) {
          return normalized;
        }
      } catch {
        // Ignore per-attempt error and continue with next attempt/model.
      }
    }

    return null;
  }

  private async callModel(token: string, prompt: string, model: string): Promise<string> {
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model,
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
