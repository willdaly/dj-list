'use strict';

function logAndSendError(res, err) {
  console.error(err);
  return res.status(500).send({ error: 'internal server error' });
}

function logAndRenderError(res, err) {
  console.error(err);
  return res.status(500).render('home/index', { message: 'internal server error' });
}

function asyncHandler(fn, onError) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => onError(res, err));
  };
}

exports.logAndSendError = logAndSendError;
exports.logAndRenderError = logAndRenderError;
exports.asyncHandler = asyncHandler;
