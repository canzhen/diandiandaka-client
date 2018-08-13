var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var user = require('./routes/user');
var topic = require('./routes/topic');
var qiniu = require('./routes/qiniu');
var userTopic = require('./routes/userTopic');
var topicUrl = require('./routes/topicUrl');
var topicCheck = require('./routes/topicCheck');
var message = require('./routes/message');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'jade');

app.use('/', routes);
app.use('/qiniu', qiniu);
app.use('/topic', topic);
app.use('/user', user);
app.use('/userTopic', userTopic);
app.use('/topicUrl', topicUrl);
app.use('/topicCheck', topicCheck);
app.use('/message', message);


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
    res.send({
      'error_code': 100,
      'msg':err.message
    });
});


module.exports = app;
