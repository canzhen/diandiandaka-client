var express = require('express');
var dbhelper = require('../helpers/dbhelper.js')
var router = express.Router();

/* GET users listing. */
// router.get('/', function (req, res) {
//   res.send('<p>you are reaching 嘻嘻嘻</p>');
// });


/**
 * 往topic table里添加一条数据
 */
router.post('/createtopic', function (req, res) {
  console.log('查看session:');
  console.log(req.session);
  if (!req.body.topicname || !req.body.topicurl) return false;
  /* 1. 往topic表里新增或更新数据 */
  // 查看topic表是否已经存在相应的数据
  dbhelper.checkTopic(req.body.topicname, (ifExist) => {
    /* 如果存在，则在该卡片的记录的打卡人数上加一 */
    if (ifExist) {
      dbhelper.updateTopic(req.body.topicname, (updateStatus) => {});
    } else {/* 如果不存在，则需要往卡片表新增一条数据 */
      dbhelper.insertTopic(req.body.topicname, req.body.topicurl, 1, (result) => {});
    }
    /* 2. 往用户卡片表里新增一条数据 */
    dbhelper.insertUserTopic(req.session.openId, req.body.topicname, 
                             req.body.topicurl, 0, req.body.startdate,
                             req.body.enddate, (result, errmsg) => {
      if (result) {
        res.send({ 'errorCode': 200, 
                    'msg': 'insert into topic and user_topic table success' });
      } else {
        console.log(errmsg);
        let errReason = errmsg.substr(0, errmsg.indexOf(':')); 
        let status = 200;
        if (errReason == 'ER_DUP_ENTRY') status = 101;
        res.send({ 'errorCode': status, 'msg': errmsg });
      }
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
    if (result) res.send({'errorCode': 200});
    else res.send({'errorCode': 100});
  })
});

/**
 * 更新topic table里的使用人数
 */
router.post('/updatetopic', function (req, res) {
  if (!req.body.topicname) {
    res.send({'errorCode': 100});
    return;
  }
  dbhelper.updateTopic(req.body.topicname, (updateStatus) => {
    let errorCode = updateStatus ? 200 : 100;
    res.send({ 'errorCode': updateStatus});
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
    let errorCode = status ? 200 : 100;
    res.send({
      'errorCode': errorCode,
      'data': alldata });
  });
});

module.exports = router;