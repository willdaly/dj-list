'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');

exports.loginPage = (req, res)=>{
  res.render('users/login', {title: 'login page'});
};

exports.login = (req, res)=>{
  User.login(req.body, user=>{
    if (user){
      req.session.userId = user._id;
      res.redirect('/lists');
    }else{
      res.redirect('/login');
    }
  });
};

exports.logout = (req, res)=>{
  req.session = null;
  res.redirect('/');
};

exports.create = (req, res)=>{
  User.create(req.body, user=>{
    if(user){
      req.session.userId = user._id;
      res.redirect('/lists');
    }else{
      res.redirect('/login');
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
