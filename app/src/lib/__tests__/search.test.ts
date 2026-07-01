import { describe, expect, it } from 'vitest';
import type { Sport } from '../../types';
import { fuzzyScore, hitHref, searchSportsAndLeagues } from '../search';

function makeSport(overrides: Partial<Sport> = {}): Sport {
  return {
    key: 'basketball_nba',
    group: 'Basketball',
    title: 'NBA',
    description: 'US Basketball',
    active: true,
    has_outrights: false,
    ...overrides,
  };
}

describe('fuzzyScore', () => {
  it('scores an exact match highest', () => {
    expect(fuzzyScore('nba', 'NBA')).toBe(100);
  });

  it('scores a prefix match above a substring match', () => {
    const prefix = fuzzyScore('prem', 'Premier League')!;
    const substring = fuzzyScore('ier lea', 'Premier League')!;
    expect(prefix).toBeGreaterThan(substring);
  });

  it('matches out-of-order, partial multi-word queries', () => {
    expect(fuzzyScore('leag prem', 'Premier League')).not.toBeNull();
  });

  it('tolerates a single-character typo', () => {
    expect(fuzzyScore('lakerz', 'Lakers')).not.toBeNull();
  });

  it('does not treat unrelated short words one edit apart as a match', () => {
    expect(fuzzyScore('jets', 'Nets')).toBeNull();
    expect(fuzzyScore('rays', 'Rams')).toBeNull();
  });

  it('is case- and accent-insensitive', () => {
    expect(fuzzyScore('nurnberg', 'Nürnberg')).not.toBeNull();
  });

  it('returns null when a query token matches nothing', () => {
    expect(fuzzyScore('xyz123', 'Premier League')).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(fuzzyScore('', 'Premier League')).toBeNull();
  });
});

describe('searchSportsAndLeagues', () => {
  const sports: Sport[] = [
    makeSport(),
    makeSport({
      key: 'soccer_epl',
      group: 'Soccer',
      title: 'Premier League',
      description: 'English Premier League',
    }),
    makeSport({
      key: 'basketball_wnba',
      group: 'Basketball',
      title: 'WNBA',
      description: 'US Women’s Basketball',
    }),
  ];

  it('returns no results for a blank query', () => {
    expect(searchSportsAndLeagues(sports, '   ')).toEqual([]);
  });

  it('matches a sport group and dedupes repeated groups', () => {
    const hits = searchSportsAndLeagues(sports, 'basketball');
    const sportHits = hits.filter((h) => h.category === 'SPORT');
    expect(sportHits).toHaveLength(1);
    expect(sportHits[0]).toMatchObject({ label: 'Basketball', sportGroup: 'Basketball' });
  });

  it('matches a league by title with a fuzzy multi-word query', () => {
    const hits = searchSportsAndLeagues(sports, 'prem leag');
    const leagueHits = hits.filter((h) => h.category === 'LEAGUE');
    expect(leagueHits.map((h) => h.label)).toContain('Premier League');
  });

  it('carries sportGroup/leagueKey through for league hits', () => {
    const hits = searchSportsAndLeagues(sports, 'NBA');
    const nba = hits.find((h) => h.category === 'LEAGUE' && h.label === 'NBA');
    expect(nba).toMatchObject({ sportGroup: 'Basketball', leagueKey: 'basketball_nba' });
  });
});

describe('hitHref', () => {
  it('links a SPORT hit to its sport page', () => {
    expect(hitHref({ category: 'SPORT', label: 'Basketball', sportGroup: 'Basketball' })).toBe(
      '/sport/Basketball',
    );
  });

  it('links a LEAGUE hit to its league page', () => {
    expect(
      hitHref({
        category: 'LEAGUE',
        label: 'NBA',
        sportGroup: 'Basketball',
        leagueKey: 'basketball_nba',
      }),
    ).toBe('/sport/Basketball/league/basketball_nba');
  });

  it('links a TEAM hit to its league page', () => {
    expect(
      hitHref({
        category: 'TEAM',
        label: 'Lakers',
        sportGroup: 'Basketball',
        leagueKey: 'basketball_nba',
      }),
    ).toBe('/sport/Basketball/league/basketball_nba');
  });

  it('links a DATE hit to the cross-sport live view', () => {
    expect(hitHref({ category: 'DATE', label: 'Sat, Jul 4' })).toBe('/live');
  });

  it('returns null when a hit has no usable target', () => {
    expect(hitHref({ category: 'LEAGUE', label: 'NBA' })).toBeNull();
  });

  it('encodes group/key segments for URL safety', () => {
    expect(
      hitHref({
        category: 'LEAGUE',
        label: 'X',
        sportGroup: 'Motor Sports',
        leagueKey: 'a/b',
      }),
    ).toBe('/sport/Motor%20Sports/league/a%2Fb');
  });
});
