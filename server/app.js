var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var user = require('./routes/user');
var userTopic = require('./routes/userTopic');
var topic = require('./routes/topic');
var qiniu = require('./routes/qiniu');

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



/**
 * 对所有post请求进行权限拦截，
 * 必须headers里包含session-id，否则不放行
 */
// app.all('/*', function (req, res, next) {
//   console.log('抓到一个请求');
//   if (req.method == 'POST'){console.log('抓到一个post');}
  // if (req.session.user) {
  //   next();
  // } else {
  //   var arr = req.url.split('/');// 解析用户请求的路径

  //   for (var i = 0, length = arr.length; i < length; i++) {// 去除 GET 请求路径上携带的参数
  //     arr[i] = arr[i].split('?')[0];
  //   }
  //   if (arr.length > 1 && arr[1] == '') {// 判断请求路径是否为根、登录、注册、登出，如果是不做拦截
  //     next();
  //   } else if (arr.length > 2 && arr[1] == 'user' && (arr[2] == 'register' || arr[2] == 'login' || arr[2] == 'logout' || arr[2].indexOf('login') > 0)) {
  //     next();
  //   } else {  // 登录拦截
  //     req.session.originalUrl = req.originalUrl ? req.originalUrl : null;  // 记录用户原始请求路径
  //     req.flash('error', '请先登录');
  //     res.redirect('/user/login');  // 将用户重定向到登录页面
  //   }
  // }
// });

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
