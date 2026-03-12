'use strict';

exports.index = (req, res)=>{
  res.render('home/index', {title: 'DJ List'});
};

exports.reactApp = (req, res)=>{
  if (process.env.REACT_UI_ENABLED !== 'true') {
    return res.redirect('/');
  }

  return res.render('home/react', {title: 'DJ List React', reactPage: true});
};
