const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const messageHelper = require('./helpers/messageHelper.js')

const routes = require('./routes/index');
const qiniu = require('./routes/qiniu');
const me = require('./routes/me');

const user = require('./routes/db/user');
const topic = require('./routes/db/topic');
const userTopic = require('./routes/db/userTopic');
const topicUrl = require('./routes/db/topicUrl');
const topicCheck = require('./routes/db/topicCheck');
const userMessage = require('./routes/db/userMessage');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'jade');

app.use('/', routes);
app.use('/qiniu', qiniu);
app.use('/me', me);
app.use('/db/topic', topic);
app.use('/db/user', user);
app.use('/db/userTopic', userTopic);
app.use('/db/topicUrl', topicUrl);
app.use('/db/topicCheck', topicCheck);
app.use('/db/userMessage', userMessage);


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


// messageHelper.sendMessage(
//   'ovMv05WNSF-fzJnoQ4UMSWtMWjFs',
//   '6a4b10240441483f47fc8e2f433d989b',
//   {
//     keyword1: { value: '减肥' }, //打卡项目
//     keyword2: { value: '2018年8月14日' }, //打卡时间
//     keyword3: { value: '13' }, //已打卡天数
//     keyword4: { value: '23' }, //今日排名
//     keyword5: { value: '55' }, //参加人数
//     keyword6: { value: '坚持不懈才能积沙成塔喔~' }, //温馨提示
//   },
//   (res) => {
//     if (res) console.log('推送消息成功');
//     else console.log('推送消息失败');
//   }
// )

// setInterval(()=>{
//   messageHelper.sendMessage(
//     'ovMv05WNSF-fzJnoQ4UMSWtMWjFs',
//     '6a4b10240441483f47fc8e2f433d989b',
//     {
//       keyword1: { value: '减肥' }, //打卡项目
//       keyword2: { value: '2018年8月14日' }, //打卡时间
//       keyword3: { value: '13' }, //已打卡天数
//       keyword4: { value: '23' }, //今日排名
//       keyword5: { value: '55' }, //参加人数
//       keyword6: { value: '坚持不懈才能积沙成塔喔~' }, //温馨提示
//     }
//   )
// }, 1000*60*60*24); //间隔时间1天

module.exports = app;
