import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SearchPalette } from '../SearchPalette';
import type { Sport } from '../../types';

vi.mock('../../lib/api', () => ({
  getSportsList: vi.fn(),
}));

import { getSportsList } from '../../lib/api';

function sport(overrides: Partial<Sport>): Sport {
  return {
    key: 'league_key',
    group: 'Basketball',
    title: 'NBA',
    description: '',
    active: true,
    has_outrights: false,
    ...overrides,
  };
}

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

function renderPalette() {
  return render(
    <MemoryRouter>
      <SearchPalette />
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function openPalette() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Search sports, leagues, teams, and dates' }),
  );
  return within(await screen.findByRole('dialog', { name: 'Search' }));
}

describe('SearchPalette', () => {
  it('shows matching sports and leagues as the user types', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
      sport({ key: 'soccer_epl', group: 'Soccer', title: 'Premier League' }),
    ]);

    renderPalette();
    const dialog = await openPalette();

    fireEvent.change(
      dialog.getByRole('textbox', { name: 'Search sports, leagues, teams, and dates' }),
      { target: { value: 'prem leag' } },
    );

    expect(await dialog.findByRole('option', { name: /Premier League/ })).toBeInTheDocument();
    expect(dialog.queryByRole('option', { name: /NBA/ })).not.toBeInTheDocument();
  });

  it('shows a "no matches" empty state for an unmatched query', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
    ]);

    renderPalette();
    const dialog = await openPalette();

    fireEvent.change(
      dialog.getByRole('textbox', { name: 'Search sports, leagues, teams, and dates' }),
      { target: { value: 'zzzznotreal' } },
    );

    expect(await dialog.findByText(/No matches for/)).toBeInTheDocument();
  });

  it('navigates to the selected result on click', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
    ]);

    renderPalette();
    const dialog = await openPalette();

    fireEvent.change(
      dialog.getByRole('textbox', { name: 'Search sports, leagues, teams, and dates' }),
      { target: { value: 'NBA' } },
    );

    fireEvent.click(await dialog.findByRole('option', { name: /NBA/ }));

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/sport/Basketball/league/basketball_nba',
    );
  });

  it('navigates to the active result on Enter', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
    ]);

    renderPalette();
    const dialog = await openPalette();
    const input = dialog.getByRole('textbox', {
      name: 'Search sports, leagues, teams, and dates',
    });

    fireEvent.change(input, { target: { value: 'NBA' } });
    await dialog.findByRole('option', { name: /NBA/ });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/sport/Basketball/league/basketball_nba',
    );
  });
});
