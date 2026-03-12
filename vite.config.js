const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: resolve(__dirname, 'app/frontend'),
  build: {
    outDir: resolve(__dirname, 'app/static/assets'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'app/frontend/main.js'),
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
