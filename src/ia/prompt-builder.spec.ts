import { PromptBuilder } from './prompt-builder';

describe('PromptBuilder', () => {
  it('builds evaluation prompt with source text and required JSON keys', () => {
    const text = "Je suis aller a l'ecole.";

    const prompt = PromptBuilder.buildEvaluationPrompt(text);

    expect(prompt).toContain(text);
    expect(prompt).toContain('Reponds UNIQUEMENT en JSON valide');
    expect(prompt).toContain('"correction"');
    expect(prompt).toContain('"note"');
    expect(prompt).toContain('"commentaire"');
  });

  it('provides strict and hard repair prompts', () => {
    expect(PromptBuilder.strictRepairPrompt()).toContain('JSON valide');
    expect(PromptBuilder.hardRepairPrompt()).toContain('SORTIE STRICTE');
  });
});
