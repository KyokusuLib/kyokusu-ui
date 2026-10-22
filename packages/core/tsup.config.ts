import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2020',
  dts: false,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // CSS is emitted as a real file (dist/index.css). Runtime style injection
  // breaks SSR and CSP, so it is intentionally disabled.
  injectStyle: false,
  // Regenerate the standalone ContextMenu stylesheet after each build/watch
  // cycle, so `@kyokusu-ui/core/context-menu.css` is also available in dev.
  onSuccess: 'node scripts/build-context-menu-css.mjs',
});
