
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // This allows the app to use process.env.API_KEY as required by the SDK guidelines
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    host: true, // Listen on all network interfaces
    port: 5173  // Default Vite port (optional, can be omitted)
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
