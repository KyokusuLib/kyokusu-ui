import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.ts'],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcovonly'],
      reportsDirectory: './coverage',
      include: ['packages/vue/src/**/*.{ts,vue}'],
      exclude: [
        'packages/vue/src/**/*.test.ts',
        'packages/vue/src/**/index.ts',
        'packages/vue/src/**/types.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 69,
        functions: 84,
        lines: 83,
      },
    },
  },
});
