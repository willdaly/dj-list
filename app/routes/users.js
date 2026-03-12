'use strict';

var User = require(__dirname + '/../models/user.js');
var logAndRenderError = function(res, err) {
  console.error(err);
  return res.status(500).render('home/index', {message: 'internal server error'});
};

exports.bounce = (req, res, next)=>{
  if(res.locals.user){
    next();
  } else {
    res.render('home/index', {message: 'must be signed in'});
  }
};

exports.verify = (req, res)=>{
  User.findById(req.params.id, (err, user)=>{
    if (err) {
      return logAndRenderError(res, err);
    }
    res.render('users/verify', {user: user});
  });
};

exports.password = (req, res)=>{
  User.findById(req.params.id, (err, user)=>{
    if (err) {
      return logAndRenderError(res, err);
    }
    if (!user) {
      return res.status(404).render('home/index', {message: 'user not found'});
    }
    user.changePassword(req.body.password, function(changeErr){
      if (changeErr) {
        return logAndRenderError(res, changeErr);
      }
      return res.render('home/index', {message: 'account verified. now you can sign in'});
    });
  });
};

exports.login = (req, res)=>{
  User.login(req.body, (err, user, message)=>{
    if (err) {
      return logAndRenderError(res, err);
    }
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
  User.create(req.body, (err, user, message)=>{
    if (err) {
      return logAndRenderError(res, err);
    }
    if(user){
      res.render('home/index', {message: message});
    }else{
      res.render('home/index', {message: message});
    }
  });
};

exports.lookup = (req, res, next)=>{
  if(req.session.userId){
    User.findById(req.session.userId, (err, user)=>{
      if (err) {
        return logAndRenderError(res, err);
      }
      if(user){
        res.locals.user = user;
      }else{
        res.locals.user = null;
      }
      next();
    });
  }else{
    res.locals.user = null;
    next();
  }
};
