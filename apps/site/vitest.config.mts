import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The tests that render a component (the film message) import it through the site's own "@/" paths and use JSX.
export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
