import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

const API_BASE = 'http://127.0.0.1:4000';
const API_PROXY_PATHS = [
  '/api/session', '/search', '/artistSearch', '/albumSearch', '/songSearch',
  '/guessSearch', '/genreFilter', '/bpm', '/key', '/bpmKey', '/playlists',
  '/createPlaylist', '/addToPlaylist', '/renamePlaylist', '/deleteFromPlaylist',
  '/deletePlaylist', '/updateOrder', '/auth/spotify', '/logout'
];

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(API_PROXY_PATHS.map((path) => [path, API_BASE]))
  },
  build: {
    outDir: resolve(__dirname, '../static/assets-react'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'app.css';
          }
          return '[name][extname]';
        }
      }
    }
  }
});
