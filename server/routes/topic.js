const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();



/**
 * 获取topic表的所有数据
 */
router.post('/getAll', function (req, res) {
  dbhelper.select(
    'topic', '', '', [],
    'ORDER BY use_people_num DESC LIMIT ' + req.body.limit_num,
    (status, result_list) => {
      for (var i in result_list) {
        result_list[i]['topic_url'] = config.qiniu.prefix + result_list[i]['topic_url'];
      }
      let error_code = status ? 200 : 100;
      res.send({
        'error_code': error_code,
        'data': result_list
      });
    });
});






/**
 * 往topic table里添加一条数据
 */
router.post('/createtopic', function (req, res) {
  if (!req.body.topicname || !req.body.topicurl) return false;

  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }

  /* 1. 往用户卡片表里新增一条数据 */
  // 从redis里获取用户的唯一标识：openid
  let sessionid = req.header('session-id')
  redishelper.getValue(sessionid, (value) => {
    if (!value) {
      res.send({ 'error_code': 102, 'msg': 'redis数据库里找不到对应用户数据' });
      return;
    }
    dbhelper.insert('user_topic', 
      'user_id, topic_name, topic_url, insist_day, start_date, end_date', 
      [value, req.body.topicname, req.body.topicurl, 0, req.body.startdate,
      req.body.enddate,], '',
      (status, errmsg) => {
        if (!status){
          let errReason = errmsg.substr(0, errmsg.indexOf(':'));
          if (errReason == 'ER_DUP_ENTRY')
            res.send({ 'error_code': 101, 'msg': errmsg });
          else res.send({ 'error_code': 100, 'msg': errmsg });
          return;
        }



        /* 2. 如果成功插入user_topic，则开始更新topic表 */
        // 存在，则打卡人数加一；不存在，新增数据
        dbhelper.insert('topic', 'topic_name, topic_url, use_people_num',
          [req.body.topicname, req.body.topicurl, 1],
          "ON DUPLICATE KEY UPDATE use_people_num=use_people_num+1",
          (status, errmsg) => {
            let error_code = status ? 200 : 100;
            res.send({ 'error_code': error_code, 'msg': '' });
            return;
          });
    });
  });
});



module.exports = router;