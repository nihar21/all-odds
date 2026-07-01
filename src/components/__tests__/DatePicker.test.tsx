import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { DatePicker } from '../DatePicker';

const todayKey = today(getLocalTimeZone()).toString();
const otherKey = today(getLocalTimeZone()).subtract({ days: 1 }).toString();

function renderPicker(overrides: {
  dates?: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const onChange = overrides.onChange ?? (() => {});
  render(
    <DatePicker
      dates={overrides.dates ?? [otherKey, todayKey]}
      value={overrides.value ?? otherKey}
      onChange={onChange}
    />,
  );
}

async function openPopover() {
  fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
  return within(await screen.findByRole('dialog', { name: 'Pick a date' }));
}

describe('DatePicker "Today" shortcut', () => {
  it('shows the above-the-date shortcut when today has events and is not selected', () => {
    renderPicker({ value: otherKey });
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('hides the above-the-date shortcut once today is selected', () => {
    renderPicker({ value: todayKey });
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
  });

  it('hides the above-the-date shortcut when today has no events', () => {
    renderPicker({ dates: [otherKey], value: otherKey });
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
  });

  it('jumps to today when the shortcut is clicked', () => {
    const onChange = vi.fn();
    renderPicker({ value: otherKey, onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith(todayKey);
  });

  it('disables the popover "Today" action when today has no events', async () => {
    renderPicker({ dates: [otherKey], value: otherKey });
    const dialog = await openPopover();
    expect(dialog.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  it('selects today from the popover "Today" action when available', async () => {
    const onChange = vi.fn();
    renderPicker({ value: otherKey, onChange });
    const dialog = await openPopover();
    fireEvent.click(dialog.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith(todayKey);
  });
});
