import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    proxy: {
      '/api/session': 'http://127.0.0.1:4000',
      '/search': 'http://127.0.0.1:4000',
      '/guessSearch': 'http://127.0.0.1:4000',
      '/genreFilter': 'http://127.0.0.1:4000',
      '/bpm': 'http://127.0.0.1:4000',
      '/key': 'http://127.0.0.1:4000',
      '/bpmKey': 'http://127.0.0.1:4000',
      '/playlists': 'http://127.0.0.1:4000',
      '/createPlaylist': 'http://127.0.0.1:4000',
      '/addToPlaylist': 'http://127.0.0.1:4000',
      '/renamePlaylist': 'http://127.0.0.1:4000',
      '/deleteFromPlaylist': 'http://127.0.0.1:4000',
      '/deletePlaylist': 'http://127.0.0.1:4000',
      '/auth/spotify': 'http://127.0.0.1:4000',
      '/logout': 'http://127.0.0.1:4000'
    }
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
