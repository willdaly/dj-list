'use strict';

const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user.js'));
const crypto = require('crypto');
const { logAndRenderError, asyncHandler } = require(path.join(__dirname, '..', 'lib', 'errors.js'));

exports.bounce = (req, res, next)=>{
  if(res.locals.user){
    next();
  } else {
    res.render('home/index', {message: 'must be signed in'});
  }
};

exports.spotifyStart = asyncHandler((req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).render('home/index', { message: 'spotify oauth not configured' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.spotifyState = state;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user-read-email',
    state: state
  });

  return res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
}, logAndRenderError);

exports.spotifyCallback = asyncHandler(async (req, res) => {
  if (req.query.error) {
    return res.status(400).render('home/index', { message: 'spotify login cancelled' });
  }

  if (!req.query.code || !req.query.state || req.query.state !== req.session.spotifyState) {
    return res.status(400).render('home/index', { message: 'invalid oauth state' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).render('home/index', { message: 'spotify oauth not configured' });
  }

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: redirectUri
    }).toString()
  });

  if (!tokenResponse.ok) {
    return res.status(400).render('home/index', { message: 'spotify token exchange failed' });
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + tokenData.access_token
    }
  });

  if (!profileResponse.ok) {
    return res.status(400).render('home/index', { message: 'spotify profile fetch failed' });
  }

  const profile = await profileResponse.json();
  const user = await User.findOrCreateFromSpotify(profile);
  req.session.userId = user._id;
  req.session.spotifyState = null;
  return res.redirect('/');
}, logAndRenderError);

exports.testLogin = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(404).send('not found');
  }

  const user = await User.findOrCreateFromSpotify({
    id: 'smoke-test-user',
    email: 'smoke-test-user@example.com',
    display_name: 'Smoke Test User'
  });
  req.session.userId = user._id;
  return res.status(204).send();
}, logAndRenderError);

exports.session = (req, res)=>{
  if (!res.locals.user) {
    return res.send({authenticated: false, user: null});
  }

  return res.send({
    authenticated: true,
    user: {
      _id: String(res.locals.user._id),
      spotifyId: res.locals.user.spotifyId || null,
      email: res.locals.user.email || null,
      displayName: res.locals.user.displayName || null,
      isValid: Boolean(res.locals.user.isValid)
    }
  });
};

exports.logout = (req, res)=>{
  req.session = null;
  res.redirect('/');
};

exports.lookup = asyncHandler(async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    res.locals.user = user || null;
    return next();
  }
  res.locals.user = null;
  return next();
}, logAndRenderError);
