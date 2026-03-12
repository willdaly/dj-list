'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['app/frontend-react/**', 'app/static/**', 'node_modules/**'] },
  {
    files: ['app/**/*.js', 'server.js', 'test/**/*.js'],
    languageOptions: {
      globals: { ...globals.node }
    },
    rules: js.configs.recommended.rules
  }
];
