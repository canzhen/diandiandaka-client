var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var routes = require('./routes/index');
var users = require('./routes/user');
var topic = require('./routes/topic');
var qiniu = require('./routes/qiniu');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('canzhenbeautiful'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: '6379',
    ttl: 120000, //单位毫秒 120s,2min
    logErrors: true,
  }),
  resave: false,
  saveUninitialized: false,
  secret: 'canzhenbeautiful',
  cookie: { maxAge: 1 * 60 * 60 * 1000 /* 一小时 */ }
}));

app.set('view engine', 'jade');

app.use('/', routes);
app.use('/topic', topic);
app.use('/user', users);
app.use('/qiniu', qiniu);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
