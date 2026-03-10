export type NormalizedEvaluation = {
  correction: string;
  note: number;
  commentaire: string;
};

export class ResponseParser {
  static extractJson(content: string): Record<string, unknown> | null {
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

  static normalizeEvaluation(
    data: Record<string, unknown> | null,
  ): NormalizedEvaluation | null {
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

  static toServiceShape(evalResult: NormalizedEvaluation): Record<string, unknown> {
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

  private static extractJsonObject(content: string): string | null {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return content.slice(start, end + 1).trim();
    }
    return null;
  }

  private static parseAndClampNote(value: unknown): number | null {
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

  private static pickString(...values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return null;
  }
}
