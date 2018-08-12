const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const TABLE_NAME = 'topic_check';
const router = express.Router();


/**
 * 打卡方法，同时涉及到topic_check表和user_topic表
 */
router.post('/check', function (req, res) {
  let id = req.header('session-id');
  let topic_check_delete_str = req.body.topic_check_delete_str,
    topic_check_delete_list = req.body.topic_check_delete_list,
    user_topic_update_list = req.body.user_topic_update_list,
    user_topic_insert_list = req.body.user_topic_insert_list,
    user_topic_update_reduce_list = req.body.user_topic_update_reduce_list;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    /* 如果有要删除的，则先删除之前的数据，
    再把新的打卡数据加进去，避免加完又被删除 */
    if (topic_check_delete_list.length != 0){
      topic_check_delete_list.unshift(openid);
      // console.log('have something to delete')
      deleteUncheck(openid);
    }else {
      // console.log('nothing to delete')
      updateCheck(openid);
    }
  });


  // 删除uncheck数据
  let deleteUncheck = function (openid) {
    // console.log('start deleting')
    dbhelper.deleteRow(TABLE_NAME,
      topic_check_delete_str,
      topic_check_delete_list,
      (status, errmsg) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': '' });
          console.log('删除topic_check里数据失败');
          return;
        }
        console.log('删除topic_check里数据成功');
        updateUncheck(openid);
      });
  };

  //update uncheck数据的user_topic表
  let updateUncheck = function (openid) {
    // console.log('start updating 【uncheck】 user_topic')
    dbhelper.updateReduceUserTopicNumberByUserId(openid,
      user_topic_update_reduce_list,
      (status) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': '' });
          console.log('update uncheck数据的user_topic表失败');
          return;
        }
        console.log('update uncheck数据的user_topic表成功');
        if (user_topic_update_list.length != 0) {
          updateCheck(openid);
          insertCheck(openid);
        } else {
          res.send({ 'error_code': 200, 'msg': '' });
        }
      });
  };

  //update check 数据的 user_topic表
  let updateCheck = function (openid) {
    // console.log('start updating 【check】 user_topic')
    dbhelper.updateUserTopicNumberByUserId(openid,
      user_topic_update_list,
      (status) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': '' });
          console.log('update check数据的user_topic表失败');
          return;
        }
        console.log('update check数据的user_topic表成功');
        insertCheck(openid);
      } );
  };


  //insert into topic_check 打卡数据
  let insertCheck = function (openid) {
    // console.log('start updating check topic_check')
    for (let i in user_topic_insert_list)
      user_topic_insert_list[i].push("'" + openid + "'");

    dbhelper.insertMulti( //update topic_check，记录具体打卡详情
      TABLE_NAME,
      'topic_name, check_time, check_timestamp, log, user_id',
      user_topic_insert_list, '',
      (status, errmsg) => {
        console.log(errmsg)
        if (!status) res.send({ 'error_code': 100, 'msg': errmsg });
        else res.send({ 'error_code': 200, 'msg': '' });
      });
  };

});



/**
 * 获取某个用户的所有打卡记录
 */
router.post('/getAll', function (req, res) {
  let id = req.header('session-id');

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.select(TABLE_NAME, 'topic_name, check_time, check_timestamp, log', 'user_id=?', [openid], 'ORDER BY check_time DESC, check_timestamp DESC',
      (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({'error_code': statusCode,'msg':'','result_list':resList});
      });
  });
});



/**
 * 删除某次打卡记录
 */
router.post('/deleteCheck', function (req, res) {
  let id = req.header('session-id');
  let topic_name = req.body.topic_name,
      check_time = req.body.check_time,
      check_timestamp = req.body.check_timestamp;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    // 删除uncheck数据
    dbhelper.deleteRow(TABLE_NAME,
      'user_id=? AND topic_name=? AND check_time=? AND check_timestamp=?',
      [openid, topic_name, check_time, check_timestamp],
      (status, errmsg) => {
        if (status) console.log('删除check记录成功');
        else console.log('删除check记录失败');
        let statusCode = status ? 200 : 100;
        res.send({ 'error_code': statusCode, 'msg': errmsg });
      });

  });
});


/**
 * 更新某个打卡日志
 */
router.post('/updateLog', function (req, res) {
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;
  let check_time = req.body.check_time;
  let check_timestamp = req.body.check_timestamp;
  let log = req.body.log;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.update(TABLE_NAME, 'log=?', 
    'user_id=? AND topic_name=? AND check_time=? AND check_timestamp=?', 
    [log, openid, topic_name, check_time, check_timestamp], 
    (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
      });
  });
});



/**
 * 更新卡片名称
 */
router.post('/updateName', function (req, res) {
  let id = req.header('session-id');
  let original_topic_name = req.body.original_topic_name,
      topic_name = req.body.topic_name;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
  });
});


module.exports = router;