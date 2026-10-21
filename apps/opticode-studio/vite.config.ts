import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-zxing-reader-wasm',
      apply: 'build',
      writeBundle(outputOptions) {
        const outDir = outputOptions.dir ?? join(process.cwd(), 'dist');
        const source = require.resolve('zxing-wasm/reader/zxing_reader.wasm');
        const target = join(outDir, 'zxing_reader.wasm');
        mkdirSync(outDir, { recursive: true });
        copyFileSync(source, target);
      },
    },
  ],
  base: '/OptiCode-Studio/',
  build: {
    // Keep a deterministic build manifest so the service worker can
    // precache every generated JS/CSS/worker asset for true offline startup.
    manifest: 'manifest.json',
  },
});
