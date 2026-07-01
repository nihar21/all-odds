import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OddsEvent } from '../../types';
import { clearFavoriteBooks, getFavoriteBooks } from '../../lib/favoriteBooks';
import { BookFilter } from '../BookFilter';
import { OddsTable } from '../OddsTable';

const event: OddsEvent = {
  id: 'e1',
  sport_key: 'basketball_nba',
  sport_title: 'NBA',
  commence_time: new Date(Date.now() + 3600_000).toISOString(),
  home_team: 'Lakers',
  away_team: 'Celtics',
  bookmakers: [
    {
      key: 'fanduel',
      title: 'FanDuel',
      last_update: new Date().toISOString(),
      markets: [
        {
          key: 'h2h',
          last_update: new Date().toISOString(),
          outcomes: [
            { name: 'Lakers', price: -150 },
            { name: 'Celtics', price: 130 },
          ],
        },
      ],
    },
    {
      key: 'draftkings',
      title: 'DraftKings',
      last_update: new Date().toISOString(),
      markets: [
        {
          key: 'h2h',
          last_update: new Date().toISOString(),
          outcomes: [
            { name: 'Lakers', price: -145 },
            { name: 'Celtics', price: 125 },
          ],
        },
      ],
    },
  ],
};

function renderFilterAndTable() {
  return render(
    <div>
      <BookFilter label="Sportsbooks" />
      <OddsTable event={event} market="h2h" />
    </div>,
  );
}

describe('BookFilter + OddsTable favorites sync', () => {
  beforeEach(() => {
    clearFavoriteBooks();
  });

  it('narrows the odds table live when a favorite is toggled, with no reload', async () => {
    const user = userEvent.setup();
    const { container } = renderFilterAndTable();
    // Column headers now render each book's logo (see #65), so their text is
    // no longer part of `textContent`; check the header image's `alt`
    // instead. (Direct DOM queries, not `getByRole`, because react-aria's
    // popover marks the rest of the page `aria-hidden` while open, which
    // would hide the table from accessibility-tree-based role queries.)
    const headerBook = (title: string) =>
      container.querySelector(`th[scope="col"] img[alt="${title}"]`);

    expect(headerBook('DraftKings')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sportsbooks' }));
    await user.click(screen.getByRole('option', { name: 'FanDuel' }));

    expect(headerBook('DraftKings')).not.toBeInTheDocument();
    expect(headerBook('FanDuel')).toBeInTheDocument();
  });

  it('keeps the selected favorite when the popover is dismissed with Escape', async () => {
    const user = userEvent.setup();
    const { container } = renderFilterAndTable();

    await user.click(screen.getByRole('button', { name: 'Sportsbooks' }));
    await user.click(screen.getByRole('option', { name: 'FanDuel' }));
    await user.keyboard('{Escape}');

    // Regression for #61: the ListBox's default `escapeKeyBehavior` of
    // "clearSelection" wiped the favorites list when Escape was used to
    // dismiss the popover (a natural way to close it), reverting the table
    // to showing every book.
    expect(getFavoriteBooks()).toEqual(['fanduel']);
    expect(container.querySelector('th[scope="col"] img[alt="DraftKings"]')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'FanDuel' })).not.toBeInTheDocument();
  });
});
