import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({ insertTypesEntry: true })
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: './src/index.ts',
      name: 'KyokusuUIVue',
      fileName: 'kyokusu-ui-vue',
      cssFileName: 'style',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Keep runtime dependencies out of the bundle. Bundling Vue or the icon
      // set produces duplicate instances and a needlessly large package.
      external: ['vue', /^@phosphor-icons\/vue/],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
