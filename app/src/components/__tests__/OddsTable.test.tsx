import { StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OddsEvent, MarketKey } from '../../types';
import { OddsTable } from '../OddsTable';

afterEach(cleanup);

function makeEvent(): OddsEvent {
  return {
    id: 'evt-1',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    home_team: 'Lakers',
    away_team: 'Celtics',
    bookmakers: [
      {
        key: 'fanduel',
        title: 'FanDuel',
        last_update: '',
        markets: [
          {
            key: 'h2h',
            last_update: '',
            outcomes: [
              { name: 'Celtics', price: 200 },
              { name: 'Lakers', price: -150 },
            ],
          },
          {
            key: 'totals',
            last_update: '',
            outcomes: [
              { name: 'Over', price: -110, point: 220.5 },
              { name: 'Under', price: -110, point: 220.5 },
            ],
          },
        ],
      },
    ],
  };
}

function outcomeRows() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('rowheader')[0].querySelector('div')?.textContent);
}

describe('OddsTable sort reset', () => {
  it('resets an active sort to the natural order when the market prop changes, even under StrictMode', async () => {
    const user = userEvent.setup();
    const event = makeEvent();

    const { rerender } = render(
      <StrictMode>
        <OddsTable event={event} market="h2h" />
      </StrictMode>,
    );

    // Sort by Outcome descending (two clicks: asc, then desc).
    const outcomeHeader = screen.getByRole('button', { name: /outcome/i });
    await user.click(outcomeHeader);
    await user.click(outcomeHeader);
    expect(outcomeRows()).toEqual(['Lakers', 'Celtics']);

    // Switching the market must not carry the stale sort over — this is a
    // regression test for a bug where mutating a ref (instead of state) to
    // track the previous market silently failed to reset under
    // React.StrictMode's double-invoked render pass.
    rerender(
      <StrictMode>
        <OddsTable event={event} market={'totals' as MarketKey} />
      </StrictMode>,
    );

    expect(outcomeRows()).toEqual(['Over', 'Under']);
    const outcomeHeaderAfter = screen.getByRole('button', { name: /outcome/i });
    expect(outcomeHeaderAfter.closest('th')).toHaveAttribute('aria-sort', 'none');
  });
});
