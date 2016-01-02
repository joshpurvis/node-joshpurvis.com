var notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 400;
  next(err);
};

var error = function(err, req, res, next) {
  var debug = process.env.NODE_ENV == 'development';
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: debug ? err : {}
  });
};

exports.notFound = notFound;
exports.error = error;