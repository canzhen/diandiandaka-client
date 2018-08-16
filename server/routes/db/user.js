const express = require('express');
const config = require('../../config.js');
const utils = require('../../helpers/utils.js');
const dbhelper = require('../../helpers/dbhelper.js');
const redishelper = require('../../helpers/redishelper.js');
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
 * 更新用户的头像
 */
router.post('/updateAvatarUrl', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid){
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    // console.log('openid:' + openid);
    let url = req.body.url;
    dbhelper.update('user', 'avatar_url=?', 'user_id=?', [url, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});





/**
 * 更新用户的头像
 */
router.post('/updateUserName', function (req, res) {
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
    // console.log('openid:' + openid);
    let user_name = req.body.user_name;
    dbhelper.update('user', 'user_name=?', 'user_id=?', [user_name, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});



/**
 * 保存获取到的用户的formid
 */
router.post('/updateFormId', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }//
    let form_id = req.body.form_id + ',';
    dbhelper.update('user', 'form_id=CONCAT(form_id, ?)', 'user_id=?', [form_id, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});



module.exports = router;
