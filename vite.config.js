import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from /Porfolio/; local/Vercel builds use /.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/Porfolio/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
});
