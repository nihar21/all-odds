import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../Layout';

describe('Layout footer', () => {
  it('renders the app version and commit hash', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(container.querySelector('footer')?.textContent).toContain('vtest · test');
  });
});
