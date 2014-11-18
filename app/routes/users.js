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

exports.verify = (req, res)=>{
  User.findById(req.params.id, user=>{
    res.render('users/verify', {user: user});
  });
};

exports.password = (req, res)=>{
  User.findById(req.params.id, user=>{
    user.changePassword(req.body.password, ()=>res.redirect('/', {message: 'account verified. now you can sign in'}));
  });
};

exports.login = (req, res)=>{
  User.login(req.body, (user, message)=>{
    if (user){
      req.session.userId = user._id;
      res.redirect('/');
    }else{
      res.render('home/index', {message: message});
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
      res.render('home/index', {message: message});
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
