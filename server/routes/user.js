const express = require('express');
const request = require('request');
const config = require('../config.js');
const utils = require('../helpers/utils.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const qiniuhelper = require('../helpers/qiniuhelper.js');
const router = express.Router();


/**
 * 用户登录
 * 登录其实就是一个在数据库中create user的过程，
 * 所以请求的header里带有sessionid，
 * 且sesisonoid在服务端redis没过期，
 * 那么没必要再在数据库create了，直接返回即。
 */
router.post('/login', function(req, res) {
  let code = req.body.code;
  let sessionid = req.header('session-id');
  let openid = '';
  let that = this;
  let redis_ttl = config.redis.ttl;

  let regenerateRandomId = function(openid){
    utils.generateRandom((random) => {
      redishelper.storeValue(random, openid, redis_ttl);
      res.send({ 'error_code': 200, 'msg': '', 'sessionId': random });
      return;
    });
  };

  // 如果sessionid存在且在服务端redis没过期，则直接返回
  if (sessionid){
    redishelper.getValue(sessionid, (value) => {
      if(value) { //sessionid存在，且redis没过期，直接原装打包返回
        res.send({ 'error_code': 200, 'msg': '', 'sessionId': sessionid });
        return;
      }
      // sessionid存在，但是redis过期了，这时候要重新生成sessionid，前端再保存
      // 所以直接往下走
    });
  }

  // 如果sessionid不存在，或者在redis过期了，都需要重新获取openid
  // 这时候有个问题，前端的sessionid先过期了，后端的redis还存在，就会有些废redis留着
  let getOpenID = function (code) {
    request({
      'url': config.getUserInfoUrl,
      'method': 'GET',
      'qs': {
        appid: config.appId,
        secret: config.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      },
      'json': true
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        dbhelper.insert('user', 'user_id', [body.openid], 
          "ON DUPLICATE KEY UPDATE user_id='" + body.openid + "'",
          (status, errmsg) => {
            // 不管是不是duplicate，
            // 只要前端sessionid不存在，或者后端redis过期
            // 就要重新生成sessionid返回给前端
            console.log('insert into user status:' + status);
            console.log(errmsg);
            if (!status) { //数据库insert失败，返回失败
              res.send({ 'error_code': 100, 'msg': errmsg, 'sessionId': '' });
              return;
            }
            regenerateRandomId(body.openid);
          });
      }
    });
  }

  if (sessionid) {
    redishelper.getValue(sessionid, (value) => {
      if (value) {
        res.send({'error_code': 200, 'msg': '', 'sessionId': sessionid});
        return;
      } else { getOpenID(code);}
    })
  }else{
    getOpenID(code);
  }

});




/**
 * 根据用户id获取用户的姓名和头像url
 */
router.post('/getNameAvatar', function (req, res) {
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
