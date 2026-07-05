import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookLogo } from '../BookLogo';

describe('BookLogo', () => {
  it('renders the bundled logo with the title as its accessible name', () => {
    render(<BookLogo title="FanDuel" src="/logos/books/fanduel.svg" />);
    const img = screen.getByRole('img', { name: 'FanDuel' });
    expect(img).toHaveAttribute('src', '/logos/books/fanduel.svg');
  });

  it('falls back to the plain text title when no logo path is given', () => {
    render(<BookLogo title="Some New Book" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Some New Book')).toBeInTheDocument();
  });

  it('falls back to the plain text title when the image fails to load', () => {
    render(<BookLogo title="FanDuel" src="/logos/books/fanduel.svg" />);
    fireEvent.error(screen.getByRole('img', { name: 'FanDuel' }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('FanDuel')).toBeInTheDocument();
  });

  it('renders nothing (not a text duplicate) when decorative and no logo is available', () => {
    const { container } = render(<BookLogo title="Some New Book" decorative />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides the decorative logo from the accessibility tree', () => {
    render(<BookLogo title="FanDuel" src="/logos/books/fanduel.svg" decorative />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
