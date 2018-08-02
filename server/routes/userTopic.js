const express = require('express');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();


/**
 * 通过用户id在数据库中获取该用户的卡片列表
 */
router.post('/getTopicListByUserId', function (req, res) {
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.getUserTopicByUserId(openid, (status, result) => {
      if (status){
        //删除user_id，不要暴露给前端
        for (let i in result) {
          delete result[i].user_id;
        }
        res.send({ 'error_code': 200, 'msg': '', 'result_list': result});
        return;
      }else {
        res.send({ 'error_code': 100, 'msg': result, 'result_list':''});
        return;
      }
    });
  });

});



/**
 * 通过用户id在数据库中更新该用户的卡片列表
 */
router.post('/udpateTopicListByUserId', function (req, res) {
  let id = req.header('session-id');
  var changed_topic_list = JSON.parse(req.body.changedTopicList);

  //整理数据成[['topic_name1','insist_day1', 'topic_name2', 'insist_day2', 'topic_name3', 'insist_day3', 'topic_name1', 'total_day1'.....]
  var reformat_list = [];
  for (let i in changed_topic_list){
    reformat_list.push(changed_topic_list[i]['topic_name']);
    reformat_list.push(changed_topic_list[i]['insist_day']);
  }

  for (let i in changed_topic_list) {
    reformat_list.push(changed_topic_list[i]['topic_name']);
    reformat_list.push(changed_topic_list[i]['total_day']);
  }
  console.log(reformat_list);

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.updateUserTopicByUserId(
      openid, reformat_list,
      (status) => {
        if (status)
          res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': ''});
    });
  });

});



/**
 * 打卡user_topic表
 * 返回给前端新的insist_day和total_day
 */
// router.post('/check', function (req, res) {
//   let id = req.header('session-id');
//   let topic_name = req.body.topic_name; //打卡的卡片名称
//   redishelper.getValue(id, (openid) => {
//     if (!openid) {
//       res.send({ 'error_code': 102, 'msg': '' });
//       return;
//     }
//     dbhelper.checkInsertuserTopic(
//       openid, topic_name,
//       (status) => {
//         if (!status) {
//           res.send({ 'error_code': 100, 'msg': result, 'result_list': ''})
//           return;
//         }
//         //如果成功，则向数据库获取最新的insist_day和total_day
//         dbhelper.getUserTopicByUserIdTopicName(openid, topic_name, 
//           (status, result) => {
//             if (status) res.send({ 
//               'error_code': 200, 'msg': '', 
//               'result_list': {
//                 'insist_day': result['insist_day'],
//                 'total_day': result['total_day']
//               }});
//             else 
//               res.send({ 'error_code': 100, 'msg': result, 'result_list': '' })
//           });
        
//       });
//   });
// });

module.exports = router;
