var express = require('express');
var path = require('path');
var logger = require('morgan');
var nunjucks = require('nunjucks');

var routes = require('./routes/index');
var dns = require('./routes/dns');
var error = require('./middleware/error');

// setup app
var app = express();

// template engine
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('view engine', 'html');

// middleware
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', routes);
app.use('/dns', dns);
app.use(error.error);
app.use(error.notFound);

app.listen(process.env.PORT || 3000);

module.exports = app;
