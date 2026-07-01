import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { DatePicker } from '../DatePicker';

const todayKey = today(getLocalTimeZone()).toString();
const otherKey = today(getLocalTimeZone()).subtract({ days: 1 }).toString();

describe('DatePicker "Today" shortcut', () => {
  it('shows the above-the-date shortcut when today has events and is not selected', () => {
    render(
      <DatePicker dates={[otherKey, todayKey]} value={otherKey} onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('hides the above-the-date shortcut once today is selected', () => {
    render(
      <DatePicker dates={[otherKey, todayKey]} value={todayKey} onChange={() => {}} />,
    );
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
  });

  it('hides the above-the-date shortcut when today has no events', () => {
    render(<DatePicker dates={[otherKey]} value={otherKey} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
  });

  it('jumps to today when the shortcut is clicked', () => {
    const onChange = vi.fn();
    render(
      <DatePicker dates={[otherKey, todayKey]} value={otherKey} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith(todayKey);
  });

  it('disables the popover "Today" action when today has no events', async () => {
    render(<DatePicker dates={[otherKey]} value={otherKey} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
    const dialog = await screen.findByRole('dialog', { name: 'Pick a date' });
    expect(within(dialog).getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  it('selects today from the popover "Today" action when available', async () => {
    const onChange = vi.fn();
    render(
      <DatePicker dates={[otherKey, todayKey]} value={otherKey} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
    const dialog = await screen.findByRole('dialog', { name: 'Pick a date' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith(todayKey);
  });
});
