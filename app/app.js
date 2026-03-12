'use strict';

var express        = require('express');
var less           = require('express-less');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieSession  = require('cookie-session');
var loadRoutes      = require(__dirname + '/lib/init-routes.js');
var getSessionKeys  = require(__dirname + '/lib/session-keys.js');

function createApp() {
  var sessionKeys = getSessionKeys();
  var app = express();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');

  app.use(morgan('dev'));
  app.use(express.static(__dirname + '/static'));
  app.use('/less', less(__dirname + '/less'));
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(methodOverride());
  app.use(cookieSession({keys: sessionKeys}));

  loadRoutes(app);
  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
