import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, clearCache, getAllOdds, getSportsList } from '../api';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function jsonErrorResponse(status: number, parseError: Error): Response {
  return {
    ok: false,
    status,
    json: () => Promise.reject(parseError),
  } as Response;
}

describe('api', () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on a successful request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ key: 'sport-a' }]));
    vi.stubGlobal('fetch', fetchMock);

    const sports = await getSportsList();

    expect(sports).toEqual([{ key: 'sport-a' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('caches by URL so a second call for the same sport does not re-fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ id: 'evt-1' }]));
    vi.stubGlobal('fetch', fetchMock);

    await getAllOdds('basketball_nba');
    await getAllOdds('basketball_nba');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws an ApiError with the response status on a failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'bad sport key' }, 422));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getAllOdds('not_a_real_sport_key')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'bad sport key',
    });
  });

  it('falls back to a generic message when the error body has no message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonErrorResponse(500, new Error('not json')));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getAllOdds('another_unique_sport_key')).rejects.toThrow(
      /500/,
    );
  });

  it('ApiError carries the status code', () => {
    const err = new ApiError('boom', 404);
    expect(err.status).toBe(404);
    expect(err.message).toBe('boom');
  });
});
