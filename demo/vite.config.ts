import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [preact()],
  build: { target: 'es2022' },
  server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
});
