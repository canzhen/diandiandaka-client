const express = require('express');
const config = require('../config.js');
const utils = require('../helpers/utils.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();

/**
 * 根据用户id获取用户的姓名和头像url
 */
router.post('/getNameAvatar', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  
  let sessionid = req.header('session-id');
  redishelper.getValue(sessionid, (openid) => {
    if (!sessionid){
      res.send({
        'error_code': 102, 'msg': '',
        'result_list': {}
      });
      return;
    }

    dbhelper.select('user', '', 'user_id=?', [openid], '',
      (status, result) => {
        if (!status || (status && result.length == 0)) {
          res.send({
            'error_code': 100, 'msg': '',
            'result_list': {}
          });
          return;
        }
        res.send({
          'error_code': 200, 'msg': '',
          'result_list': {
            'user_name': result[0]['user_name'],
            'avatar_url': result[0]['avatar_url']
          }
        });
        return;
      });
  });
});



/**
 * 更新用户表中的某一栏
 */
router.post('/updateColumn', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let column_name = req.body.column_name;
  let column_value = req.body.column_value;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    // console.log('openid:' + openid);
    let user_name = req.body.user_name;
    dbhelper.update('user', column_name + '=?', 
      'user_id=?', [column_value, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});




/**
 * 更新用户表中的某一栏
 */
router.post('/updateRegion', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let province = req.body.province;
  let city = req.body.city;
  let county = req.body.county;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    // console.log('openid:' + openid);
    let user_name = req.body.user_name;
    dbhelper.update('user', 'province=?, city=?, county=?',
      'user_id=?', [province, city, county, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});




module.exports = router;
