const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();


/**
 * 打卡方法，同时涉及到topic_check表和user_topic表
 */
router.post('/check', function (req, res) {
  let id = req.header('session-id');
  var changed_topic_list = JSON.parse(req.body.changedTopicList);

  //整理数据成[['topic_name1','insist_day1',...., 'topic_name1', 'total_day1',...,'topic_name1', 'if_show_log1',..]
  var reformat_user_topic_list = [];
  // push insist_day
  for (let i in changed_topic_list) {
    reformat_user_topic_list.push(changed_topic_list[i]['topic_name']);
    reformat_user_topic_list.push(changed_topic_list[i]['insist_day']);
  }
  // push total_day
  for (let i in changed_topic_list) {
    reformat_user_topic_list.push(changed_topic_list[i]['topic_name']);
    reformat_user_topic_list.push(changed_topic_list[i]['total_day']);
  }
  // push if_show_log
  for (let i in changed_topic_list) {
    reformat_user_topic_list.push(changed_topic_list[i]['topic_name']);
    reformat_user_topic_list.push(changed_topic_list[i]['if_show_log']);
  }

  // push last_check_time
  for (let i in changed_topic_list) {
    reformat_user_topic_list.push(changed_topic_list[i]['topic_name']);
    reformat_user_topic_list.push(changed_topic_list[i]['last_check_time']);
  }

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    var reformat_check_list = [];
    for (let i in changed_topic_list){
      var tmp_list = [];
      tmp_list.push("'" + openid + "'");
      tmp_list.push("'" + changed_topic_list[i]['topic_name'] + "'");
      tmp_list.push("'" + changed_topic_list[i]['last_check_time'] + "'");
      tmp_list.push("'" + changed_topic_list[i]['last_check_timestamp'] + "'");
      tmp_list.push("'" + changed_topic_list[i]['log'] + "'");
      reformat_check_list.push(tmp_list);
    }


    //update user_topic，记录用户卡片的总数据
    dbhelper.updateUserTopicNumberByUserId( 
      openid, reformat_user_topic_list,
      (status) => {
        if (!status){
          res.send({ 'error_code': 100, 'msg': '' });
          return;
        }
        dbhelper.insertMulti( //update topic_check，记录具体打卡详情
          'topic_check', 'user_id, topic_name, check_time, check_timestamp, log', reformat_check_list, '',
          (status, errmsg) => {
            if (!status) res.send({ 'error_code': 100, 'msg': errmsg });
            else res.send({ 'error_code': 200, 'msg': '' });
          });
      });
  });
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
    dbhelper.select('topic_check', 'topic_name, check_time, check_timestamp, log', 'user_id=?', [openid], 'ORDER BY check_time DESC',
      (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({'error_code': statusCode,'msg':'','result_list':resList});
      });
  });

});



module.exports = router;