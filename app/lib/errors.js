'use strict';

function logAndSendError(res, err) {
  console.error(err);
  return res.status(500).send({ error: 'internal server error' });
}

function logAndRenderError(res, err) {
  console.error(err);
  return res.status(500).render('home/index', { message: 'internal server error' });
}

exports.logAndSendError = logAndSendError;
exports.logAndRenderError = logAndRenderError;
