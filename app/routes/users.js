'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');

exports.bounce = (req, res, next)=>{
  if(res.locals.user){
    next();
  } else {
    res.render('home/index', {message: 'must be signed in'});
  }
};

exports.login = (req, res)=>{
  User.login(req.body, user=>{
    if (user){
      req.session.userId = user._id;
      res.redirect('/');
    }else{
      res.render('home/index', {message: 'invalid username/password'});
    }
  });
};

exports.logout = (req, res)=>{
  req.session = null;
  res.redirect('/');
};

exports.create = (req, res)=>{
  User.create(req.body, (user, message)=>{
    if(user){
      req.session.userId = user._id;
      res.render('home/index', {message: `user.name account created`});
    }else{
      res.render('home/index', {message: message});
    }
  });
};

exports.lookup = (req, res, next)=>{
  User.findById(req.session.userId, user=>{
    if(user){
      res.locals.user = user;
    }else{
      res.locals.user = null;
    }
    next();
  });
};
