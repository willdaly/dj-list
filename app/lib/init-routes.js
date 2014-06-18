'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var users = traceur.require(__dirname + '/../routes/users.js');
  var lists = traceur.require(__dirname + '/../routes/lists.js');

  app.all('*', users.lookup);
  app.get('/', dbg, home.index);

  app.get('/login', dbg, users.loginPage);
  app.post('/login', dbg, users.login);

  app.post('/logout', dbg, users.logout);

  app.post('/users', dbg, users.create);

  app.get('/lists', dbg, lists.index);
  app.post('/key', dbg, lists.key);
  app.post('/bpm', dbg, lists.bpm);
  app.post('/bpmKey', dbg, lists.bpmKey);

  console.log('Routes Loaded');
  fn();
}
