const express = require('express');
const dbhelper = require('../helpers/dbhelper.js')
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();


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
    dbhelper.insertUserTopic(value, req.body.topicname,
      req.body.topicurl, 0, req.body.startdate,
      req.body.enddate, (result, errmsg) => {
        if (!result) {
          console.log(errmsg);
          let errReason = errmsg.substr(0, errmsg.indexOf(':'));
          if (errReason == 'ER_DUP_ENTRY') {
            res.send({ 'error_code': 101, 'msg': errmsg });
          }else{
            res.send({ 'error_code': 100, 'msg': errmsg });
          }
          return;
        }

        /* 2. 如果成功插入user_topic，则开始更新topic表 */
        // 查看topic表是否已经存在相应的数据
        dbhelper.checkTopic(req.body.topicname, (ifExist) => {
          /* 如果存在，则在该卡片的记录的打卡人数上加一 */
          if (ifExist) {
            dbhelper.updateTopic(req.body.topicname, (updateStatus) => {
              if (updateStatus) res.send({ 'error_code': 200, 'msg': '' });
              else res.send({ 'error_code': 100, 'msg': '' });
            });
          } else {/* 如果不存在，则需要往卡片表新增一条数据 */
            dbhelper.insertTopic(req.body.topicname, req.body.topicurl, 1, (result) => {
              if (result) res.send({ 'error_code': 200, 'msg': '' });
              else res.send({ 'error_code': 100, 'msg': '' });
            });
          }
        });
      });
  });
  
  
});


/**
 * 往topic table里添加一条数据
 */
router.post('/inserttopic', function (req, res) {
  if (!req.body.topicname || !req.body.topicurl) return false;
  dbhelper.insertTopic(req.body.topicname, req.body.topicurl, 
                        1, (result) => {
    if (result) res.send({'error_code': 200});
    else res.send({'error_code': 100});
  })
});

/**
 * 更新topic table里的使用人数
 */
router.post('/updatetopic', function (req, res) {
  if (!req.body.topicname) {
    res.send({'error_code': 100});
    return;
  }
  dbhelper.updateTopic(req.body.topicname, (updateStatus) => {
    let error_code = updateStatus ? 200 : 100;
    res.send({ 'error_code': updateStatus});
  });
});

/**
 * 查看是否topic table里存在name为指定值的行
 */
router.post('/checktopic', function (req, res) {
  if (!req.body.topicname) return false;
  dbhelper.checkTopic(req.body.topicname, (ifExist) => {
    res.send({'ifExist': ifExist});
  });
});


/**
 * 获取topic表的所有数据
 */
router.get('/gettopic', function (req, res) {
  dbhelper.getTopic(req.query.limit_num, (status, alldata) => {
    let error_code = status ? 200 : 100;
    res.send({
      'error_code': error_code,
      'data': alldata });
  });
});

module.exports = router;