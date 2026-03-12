'use strict';

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const loadRoutes = require(path.join(__dirname, 'lib', 'init-routes.js'));
const getSessionKeys = require(path.join(__dirname, 'lib', 'session-keys.js'));

function createApp() {
  const sessionKeys = getSessionKeys();
  const app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(morgan('dev'));
  app.use(express.static(path.join(__dirname, 'static')));
  app.use(express.urlencoded({extended:true}));
  app.use(
    cookieSession({
      keys: sessionKeys,
      sameSite: 'lax'
    })
  );

  loadRoutes(app);
  return app;
}

module.exports = createApp();
