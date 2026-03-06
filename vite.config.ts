import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'global': 'globalThis',
    },
    resolve: {
      alias: [
        { find: /^undici(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^@protobufjs\/fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^formdata-polyfill(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^node-fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^fetch-blob(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^form-data(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^whatwg-fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^isomorphic-fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^cross-fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: '@', replacement: path.resolve(__dirname, '.') },
      ],
    },
    optimizeDeps: {
      exclude: ['undici', '@protobufjs/fetch', 'formdata-polyfill', 'node-fetch', 'fetch-blob', 'form-data', 'whatwg-fetch', 'isomorphic-fetch', 'cross-fetch'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
