const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const qiniu = require('./routes/qiniu');
const me = require('./routes/me');

const user = require('./routes/user');
const dbtopic = require('./routes/db/topic');
const topic = require('./routes/topic');
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
app.use('/me', me);

app.use('/db/topic', dbtopic);
app.use('/user', user);



app.get('/images/*', function (req, res) {
  res.sendFile(__dirname + "/public" + req.url);
  console.log("Request for " + req.url + " received.");
})



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
