import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build into dist/all-odds to stay compatible with the existing Firebase Hosting config.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/all-odds',
    emptyOutDir: true,
  },
  server: {
    port: 4200,
    host: true,
  },
});
