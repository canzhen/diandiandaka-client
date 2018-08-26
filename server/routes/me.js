const express = require('express');
const config = require('../config.js');
const utils = require('../helpers/utils.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const Promise = require('promise');
const router = express.Router();


/**
 * 获取的用户的提醒设置
 */
// router.post('/getRemindSettings', function (req, res) {
//   if (!req.header('session-id')) {
//     res.send({ 'error_code': 103, 'msg': '用户未登录' });
//     return;
//   }
//   let id = req.header('session-id');
//   redishelper.getValue(id, (openid) => {
//     if (!openid) {
//       res.send({ 'error_code': 102, 'msg': '' });
//       return;
//     }
//     dbhelper.select('user_message', '', 'user_id=?', [openid], '',
//     (status, result_list) => {
//       if (!status) {
//         console.log('get settings 失败');
//         res.send({'error_code': 100, 'msg': '', 'result_list': []});
//         return;
//       }
//       res.send({'error_code': 200, 
//                 'msg': '', 
//                 'result_list': result_list });
//     });
//   });
// });



/**
 * 获取的用户的提醒设置
 */
router.post('/getUserInfo', function (req, res) {
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
    dbhelper.select('user', 
      'province, city, county, gender, wechat_id, phone_number, birthday', 
      'user_id=?', [openid], '',
      (status, result_list) => {
        if (!status) {
          cosole.log('get settings 失败');
          res.send({ 'error_code': 100, 'msg': '', 'result_list': [] });
          return;
        }
        res.send({
          'error_code': 200,
          'msg': '',
          'result_list': result_list
        });
      });
  });
});



module.exports = router;
