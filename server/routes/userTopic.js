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

    dbhelper.select('user_topic', '', 'user_id=?', [openid], '',
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
 * 通过用户id在数据库中更新该用户的打卡数据：连续天数、坚持天数
 */
router.post('/udpateNumberByUserId', function (req, res) {
  let id = req.header('session-id');
  var changed_topic_list = JSON.parse(req.body.changedTopicList);

  //整理数据成[['topic_name1','insist_day1',...., 'topic_name1', 'total_day1',...,'topic_name1', 'if_show_log1',..]
  var reformat_list = [];
  // push insist_day
  for (let i in changed_topic_list){
    reformat_list.push(changed_topic_list[i]['topic_name']);
    reformat_list.push(changed_topic_list[i]['insist_day']);
  }
  // push total_day
  for (let i in changed_topic_list) {
    reformat_list.push(changed_topic_list[i]['topic_name']);
    reformat_list.push(changed_topic_list[i]['total_day']);
  }
  // push if_show_log
  for (let i in changed_topic_list) {
    reformat_list.push(changed_topic_list[i]['topic_name']);
    reformat_list.push(changed_topic_list[i]['if_show_log']);
  }

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.updateUserTopicNumberByUserId(
      openid, reformat_list,
      (status) => {
        if (status)
          res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': ''});
    });
  });
});




/**
 * 通过用户id和卡片名称在数据库中更新该条数据的某一栏
 */
// router.post('/udpateColumnByUserIdTopicName', function (req, res) {
//   let id = req.header('session-id');
//   let topic_name = req.body.topic_name;
//   let column_name = req.body.column_name;
//   let column_value = req.body.column_value;

//   redishelper.getValue(id, (openid) => {
//     if (!openid) {
//       res.send({ 'error_code': 102, 'msg': '' });
//       return;
//     }

//     dbhelper.update('user_topic', column_name +'=?', [column_value],
//       "user_id = '" + openid + "' AND topic_name = " + topic_name,
//       (status, errmsg) => {
//         if (status)
//           res.send({ 'error_code': 200, 'msg': '' });
//         else res.send({ 'error_code': 100, 'msg': errmsg });
//       });
//   });
// });


module.exports = router;
