import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SportsMenu } from '../SportsMenu';
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

async function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: 'Browse sports' }));
  return within(await screen.findByRole('dialog', { name: 'Browse sports' }));
}

describe('SportsMenu drill-down', () => {
  it('expands a sport row to reveal its leagues on arrow click', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
      sport({ key: 'basketball_ncaab', group: 'Basketball', title: 'NCAAB' }),
      sport({ key: 'soccer_epl', group: 'Soccer', title: 'Premier League' }),
    ]);

    render(
      <MemoryRouter>
        <SportsMenu />
      </MemoryRouter>,
    );
    const dialog = await openMenu();

    expect(dialog.queryByRole('link', { name: 'NBA' })).not.toBeInTheDocument();

    fireEvent.click(dialog.getByRole('button', { name: 'Expand Basketball leagues' }));

    expect(dialog.getByRole('link', { name: 'NBA' })).toHaveAttribute(
      'href',
      '/sport/Basketball/league/basketball_nba',
    );
    expect(dialog.getByRole('link', { name: 'NCAAB' })).toBeInTheDocument();
    expect(dialog.queryByRole('link', { name: 'Premier League' })).not.toBeInTheDocument();
  });

  it('collapses an expanded sport row on second arrow click', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
    ]);

    render(
      <MemoryRouter>
        <SportsMenu />
      </MemoryRouter>,
    );
    const dialog = await openMenu();

    const toggle = dialog.getByRole('button', { name: 'Expand Basketball leagues' });
    fireEvent.click(toggle);
    expect(dialog.getByRole('link', { name: 'NBA' })).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(dialog.getByRole('button', { name: 'Collapse Basketball leagues' }));
    expect(dialog.queryByRole('link', { name: 'NBA' })).not.toBeInTheDocument();
  });

  it('still links the sport name to the sport overview page', async () => {
    vi.mocked(getSportsList).mockResolvedValue([
      sport({ key: 'basketball_nba', group: 'Basketball', title: 'NBA' }),
    ]);

    render(
      <MemoryRouter>
        <SportsMenu />
      </MemoryRouter>,
    );
    const dialog = await openMenu();

    expect(dialog.getByRole('link', { name: /Basketball/ })).toHaveAttribute(
      'href',
      '/sport/Basketball',
    );
  });
});
