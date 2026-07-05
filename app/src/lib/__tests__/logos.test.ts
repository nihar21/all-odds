import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_LOGO, logoFor, normalizeTeam } from '../logos';

describe('normalizeTeam', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalizeTeam('San Francisco 49ers')).toBe('san francisco 49ers');
    expect(normalizeTeam("St. Louis Cardinals")).toBe('st louis cardinals');
  });

  it('strips diacritics', () => {
    expect(normalizeTeam('Atlético Madrid')).toBe('atletico madrid');
  });

  it('collapses repeated whitespace', () => {
    expect(normalizeTeam('Real   Madrid')).toBe('real madrid');
  });
});

describe('logoFor', () => {
  it('returns the placeholder for an undefined team', () => {
    expect(logoFor(undefined)).toBe(PLACEHOLDER_LOGO);
  });

  it('returns the placeholder for an empty/whitespace team name', () => {
    expect(logoFor('   ')).toBe(PLACEHOLDER_LOGO);
  });

  it('returns the placeholder for a team not in the bundled manifest', () => {
    expect(logoFor('Some Team Not In The Manifest')).toBe(PLACEHOLDER_LOGO);
  });

  it('never throws for arbitrary input', () => {
    expect(() => logoFor('!@#$%^&*()')).not.toThrow();
  });
});
