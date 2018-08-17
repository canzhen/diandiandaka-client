const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const Promise = require('promise');
const router = express.Router();



/**
 * 获取topic表的所有数据
 */
router.post('/getAllTopic', function (req, res) {
  dbhelper.select(
    'topic', '', '', [],
    'ORDER BY use_people_num DESC LIMIT ' + req.body.limit_num,
    (status, result_list) => {
      for (var i in result_list) {
        result_list[i]['topic_url'] = result_list[i]['topic_url'];
      }
      let error_code = status ? 200 : 100;
      res.send({
        'error_code': error_code,
        'data': result_list
      });
    });
});






/**
 * 通过用户id在数据库中获取该用户的卡片列表
 */
router.post('/getUserTopic', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    dbhelper.select('user_topic', '', 'user_id=?', [openid], 
      'ORDER BY create_time',
      (status, result) => {
        if (status) {
          //删除user_id，不要暴露给前端
          for (let i in result) {
            delete result[i].user_id;
          }
          res.send({ 'error_code': 200, 'msg': '', 'result_list': result });
          return;
        } else {
          res.send({ 'error_code': 100, 'msg': result, 'result_list': '' });
          return;
        }
      }
    );
  });
});






/**
 * 用户新增一个topic
 */
router.post('/create', function (req, res) {
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

    let insertTopic = function(){
      return new Promise((resolve) => {
        /* 更新topic表 */
        // 存在，则打卡人数加一；不存在，新增数据
        dbhelper.insert('topic', 'topic_name, topic_url, use_people_num',
          [req.body.topicname, req.body.topicurl, 1],
          "ON DUPLICATE KEY UPDATE use_people_num=use_people_num+1",
          (status, errmsg) => {
            let error_code = status ? 200 : 100;
            resolve({ 'error_code': error_code, 'msg': '' });
          });
      });
    }


    let insertUserTopic = function(){
      return new Promise((resolve) => {
        dbhelper.insert('user_topic',
          'user_id, topic_name, topic_url, start_date, end_date',
          [value, req.body.topicname, req.body.topicurl, req.body.startdate, req.body.enddate,], '',
          (status, errmsg) => {
            if (!status) {
              // let errReason = errmsg.substr(0, errmsg.indexOf(':'));
              if (errmsg == 'ER_DUP_ENTRY')
                resolve({ 'error_code': 101, 'msg': errmsg });
              else resolve({ 'error_code': 100, 'msg': errmsg });
            }
            resolve({ 'error_code': 200, 'msg': errmsg })
          });
      })
    }


    Promise.all([insertTopic(), insertUserTopic()])
    .then((result) => { //如果成功
      console.log(result)
      for (let i in result) {
        if (result[i].error_code != 200) {
          res.send({
            'error_code': result[i].error_code,
            'msg': result[i].msg
          });
          return;
        }
      }
      res.send({ 'error_code': 200, 'msg': '' });
    }, (res) => { //如果失败
      res.send({ 'error_code': 100, 'msg': '' });
    });
  });
});








/**
 * 更新卡片信息
 */
router.post('/update', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }

  let id = req.header('session-id');
  let original_topic_name = req.body.original_topic_name,
      topic_name = req.body.topic_name,
      topic_url = req.body.topic_url,
      start_date = req.body.start_date,
      end_date = req.body.end_date;


  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }


    let updateUserTopic = function () {
      return new Promise((resolve) => {
        dbhelper.update('user_topic',
          'topic_name=?,topic_url=?, start_date=?,end_date=?',
          'user_id=? AND topic_name=?',
          [topic_name, topic_url, start_date, end_date, openid, original_topic_name],
          (status, errmsg) => {
            console.log('updateUserTopic的状态是：' + status)
            if (!status) {
              if (errmsg == 'ER_DUP_ENTRY')
                resolve({ 'error_code': 101, 'msg': errmsg });
              else
                resolve({ 'error_code': 100, 'msg': errmsg });
            } else
              resolve({ 'error_code': 200, 'msg': '' });
          });
      });}


    let updateTopicCheck = function () {
      return new Promise((resolve) => {
        if (topic_name == original_topic_name) {
          resolve({ 'error_code': 200, 'msg': '' });
          return;
        }
        dbhelper.update('topic_check', 'topic_name=?',
          'user_id=? AND topic_name=?',
          [topic_name, openid, original_topic_name],
          (status, result_list) => {
            let statusCode = status ? 200 : 100;
            let resList = status ? result_list : false;
            resolve({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
          });
      });}


    let updateTopic = function () {
      return new Promise((resolve) => {
        if (topic_name == original_topic_name) {
          resolve({ 'error_code': 200, 'msg': '' });
          return;
        }
        // 把原来的topic_name的打卡人数减一
        dbhelper.update('topic', 'use_people_num=use_people_num-1',
          'topic_name=?', [original_topic_name],
          (status, errmsg) => {
            console.log('减少原来topic的人数: ' + status);
            if (!status) {
              resolve({ 'error_code': 100, 'msg': '' });
              return;
            }

            // 存在，则打卡人数加一；不存在，新增数据
            dbhelper.insert('topic', 'topic_name, topic_url, use_people_num',
              [topic_name, topic_url, 1],
              "ON DUPLICATE KEY UPDATE use_people_num=use_people_num+1",
              (status, errmsg) => {
                console.log(' 存在，则打卡人数加一；不存在，新增数据: ' + status);
                let error_code = status ? 200 : 100;
                resolve({ 'error_code': error_code, 'msg': '' });
              });
          });
      })}


    Promise.all([updateUserTopic(), updateTopicCheck(), updateTopic()])
    .then((result) => { //如果成功
      console.log(result)
      for (let i in result){
        if (result[i].error_code != 200){
          res.send({ 
            'error_code': result[i].error_code, 
            'msg': result[i].msg });
          return;
        }
      }
      res.send({ 'error_code': 200, 'msg': '' });
    }, (res) => { //如果失败
      res.send({ 'error_code': 100, 'msg': '' });
    });
  });
});







/**
 * 删除卡片
 */
router.post('/delete', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;

  

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    let deleteTopicCheck = function () {
      return new Promise((resolve) => {
        dbhelper.deleteRow('topic_check', 
          'user_id=? AND topic_name=?',
          [openid, topic_name],
          (status, errmsg) => {
            if (status) resolve({ 'error_code': 200, 'msg': '' });
            else resolve({ 'error_code': 100, 'msg': errmsg });
          });
      })}

    let deleteUserTopic = function() {
      return new Promise((resolve) => {
        dbhelper.deleteRow('user_topic', 
        'user_id=? AND topic_name=?', 
        [openid, topic_name],
        (status, errmsg) => {
          if (status) resolve({ 'error_code': 200, 'msg': '' });
          else resolve({ 'error_code': 100, 'msg': errmsg });
        });
      })}


    let updateTopic = function () {
      return new Promise((resolve) => {
        dbhelper.update('topic',
          'use_people_num=use_people_num-1', 'topic_name=?',
          [topic_name],
          (status, errmsg) => {
            if (status) resolve({ 'error_code': 200, 'msg': '' });
            else resolve({ 'error_code': 100, 'msg': errmsg });
          });
      })
    }

    Promise.all([deleteTopicCheck(), deleteUserTopic(), updateTopic()])
      .then((result) => { //如果成功
        console.log(result)
        for (let i in result) {
          if (result[i].error_code != 200) {
            res.send({
              'error_code': result[i].error_code,
              'msg': result[i].msg
            });
            return;
          }
        }
        res.send({ 'error_code': 200, 'msg': '' });
      }, (res) => { //如果失败
        res.send({ 'error_code': 100, 'msg': '' });
      });
  });
});






/**
 * 通过用户id和卡片名称在数据库中更新该条数据的某一栏
 */
router.post('/udpateColumn', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;
  let column_name = req.body.column_name;
  let column_value = req.body.column_value;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    dbhelper.update('user_topic', column_name + '=?',
      "user_id = ? AND topic_name = ?",
      [column_value, openid, topic_name],
      (status, errmsg) => {
        if (status)
          res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': errmsg });
      });
  });
});



module.exports = router;