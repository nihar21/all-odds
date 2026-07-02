import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `vitest.config.ts` has `globals: false`, so `@testing-library/react`'s
// automatic afterEach cleanup isn't wired up — register it explicitly.
afterEach(() => {
  cleanup();
});
