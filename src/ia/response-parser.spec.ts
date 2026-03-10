import { ResponseParser } from './response-parser';

describe('ResponseParser', () => {
  it('extracts JSON object from plain string content', () => {
    const raw = '{"correction":"Texte corrige","note":14,"commentaire":"Bien"}';

    const parsed = ResponseParser.extractJson(raw);

    expect(parsed).toEqual({
      correction: 'Texte corrige',
      note: 14,
      commentaire: 'Bien',
    });
  });

  it('extracts JSON object from fenced markdown content', () => {
    const raw = '```json\n{"correction":"A","note":12,"commentaire":"B"}\n```';

    const parsed = ResponseParser.extractJson(raw);

    expect(parsed).toEqual({ correction: 'A', note: 12, commentaire: 'B' });
  });

  it('returns null for invalid json', () => {
    const raw = 'not-json-response';

    const parsed = ResponseParser.extractJson(raw);

    expect(parsed).toBeNull();
  });

  it('normalizes alternate keys and clamps note', () => {
    const normalized = ResponseParser.normalizeEvaluation({
      contenuCorrige: 'Version corrigee',
      noteIA: 35,
      explication: 'Commentaire utile',
    });

    expect(normalized).toEqual({
      correction: 'Version corrigee',
      note: 20,
      commentaire: 'Commentaire utile',
    });
  });

  it('returns null when required fields are missing', () => {
    const normalized = ResponseParser.normalizeEvaluation({
      correction: 'ok',
      note: 10,
    });

    expect(normalized).toBeNull();
  });

  it('maps normalized result to service shape', () => {
    const shape = ResponseParser.toServiceShape({
      correction: 'Texte corrige',
      note: 16,
      commentaire: 'Bon travail',
    });

    expect(shape).toEqual({
      correction: 'Texte corrige',
      note: 16,
      commentaire: 'Bon travail',
      contenuCorrige: 'Texte corrige',
      noteIA: 16,
      commentaireAuto: 'Bon travail',
      explication: 'Bon travail',
    });
  });
});
