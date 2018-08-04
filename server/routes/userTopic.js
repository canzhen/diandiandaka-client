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



// /**
//  * 通过用户id在数据库中更新该用户的打卡数据：连续天数、坚持天数
//  */
// router.post('/udpateNumberByUserId', function (req, res) {
// });




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
