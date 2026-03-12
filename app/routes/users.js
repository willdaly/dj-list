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

exports.verify = async (req, res)=>{
  try {
    var user = await User.findById(req.params.id);
    res.render('users/verify', {user: user});
  } catch (err) {
    return logAndRenderError(res, err);
  }
};

exports.password = async (req, res)=>{
  try {
    var user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('home/index', {message: 'user not found'});
    }
    await user.changePassword(req.body.password);
    return res.render('home/index', {message: 'account verified. now you can sign in'});
  } catch (err) {
    return logAndRenderError(res, err);
  }
};

exports.login = async (req, res)=>{
  try {
    var result = await User.login(req.body);
    var user = result.user;
    var message = result.message;
    if (user){
      req.session.userId = user._id;
      res.redirect('/');
    }else{
      res.render('home/index', {message: message});
    }
  } catch (err) {
    return logAndRenderError(res, err);
  }
};

exports.logout = (req, res)=>{
  req.session = null;
  res.redirect('/');
};

exports.create = async (req, res)=>{
  try {
    var result = await User.create(req.body);
    return res.render('home/index', {message: result.message});
  } catch (err) {
    return logAndRenderError(res, err);
  }
};

exports.lookup = async (req, res, next)=>{
  if(req.session.userId){
    try {
      var user = await User.findById(req.session.userId);
      if(user){
        res.locals.user = user;
      }else{
        res.locals.user = null;
      }
      return next();
    } catch (err) {
      return logAndRenderError(res, err);
    }
  }else{
    res.locals.user = null;
    return next();
  }
};
