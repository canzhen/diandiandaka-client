const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const TABLE_NAME = 'user_topic';
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
    dbhelper.insert(TABLE_NAME, 
      'user_id, topic_name, topic_url, start_date, end_date', 
      [value, req.body.topicname, req.body.topicurl,req.body.startdate, req.body.enddate,], '',
      (status, errmsg) => {
        if (!status){
          // let errReason = errmsg.substr(0, errmsg.indexOf(':'));
          if (errmsg == 'ER_DUP_ENTRY')
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



/**
 * 更新用户的头像
 */
router.post('/update', function (req, res) {
  let id = req.header('session-id');
  let original_topic_name = req.body.original_topic_name,
      topic_name = req.body.topic_name,
      topic_url = req.body.topic_url,
      start_date = req.body.start_date,
      end_date = req.body.end_date;


  let updateTopicCheck = function(openid){
    dbhelper.update('topic_check', 'topic_name=?',
      'user_id=? AND topic_name=?',
      [topic_name, openid, original_topic_name],
      (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
      });
  };


  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.update(TABLE_NAME, 'topic_name=?,topic_url=?, start_date=?,end_date=?', 'user_id=? AND topic_name=?', [topic_name, topic_url, start_date, end_date, openid, original_topic_name],
      (status, errmsg) => {
        if (!status) {
          if (errmsg == 'ER_DUP_ENTRY'){
            res.send({ 'error_code': 101, 'msg': errmsg });
          }
          res.send({ 'error_code': 100, 'msg': errmsg });
          return;
        }

        updateTopicCheck(openid);
      });
  });
});






/**
 * 删除卡片
 */
router.post('/delete', function (req, res) {
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;

  let deleteTopicCheck = function(openid){
    dbhelper.deleteRow('topic_check', 'user_id=? AND topic_name=?',
      [openid, topic_name],
      (status, errmsg) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': errmsg });
      });
  };

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.deleteRow(TABLE_NAME, 'user_id=? AND topic_name=?',
      [openid, topic_name],
      (status, errmsg) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': errmsg });
          return;
        }
        deleteTopicCheck(openid);
      });
  });
});




module.exports = router;