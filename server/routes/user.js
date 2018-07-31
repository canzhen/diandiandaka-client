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

  // 如果sessionid存在且在服务端redis没过期，则直接返回
  // 如果sessionid不存在，或者在redis过期了，都需要重新获取openid
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
        // 然后插入表或者更新表数据
        dbhelper.insertUser(body.openid, (result, errmsg) => {
          if (result) { //插入成功，则在redis里存储sessionid
            utils.generateRandom((random) => {
              console.log('随机生成sessionid：' + random);
              redishelper.storeValue(random, body.openid, redis_ttl);
              res.send({ 'error_code': 200, 'msg': '', 'sessionId': random });
            });
          } else res.send({ 'error_code': 100, 'msg': errmsg, 'sessionId': '' });
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




  //如果传递过来sessionid，且redis里有存openid和sessionid，则直接获取
  // if (sessionid){
  //   redishelper.getValue(sessionid, (value) => {
  //     console.log('redis获取key ' + sessionid + ':' + value);
  //     if (!value) { //如果redis里无法获取值，代表过期了，也要重新发送api请求
  //       getOpenID(code);
  //       return;
  //     }
  //     userinfo['openid'] = storeValue;
  //     dbhelper.insertUser(userinfo, (result, errmsg) => {
  //       if (result) res.send({ 'error_code': 200, 'msg': '', 'sessionId': sessionid });
  //       else res.send({ 'error_code': 100, 'msg': errmsg, 'sessionId': sessionid });
  //     });
  //   })
  // } else { //否则发送微信api请求
  //   getOpenID(code);
  // }
});

/**
 * 根据用户id获取用户的姓名和头像url
 */
router.post('/getNameAvatar', function (req, res) {
  let sessionid = req.header('session-id');
  redishelper.getValue(sessionid, (openid) => {
    if (!sessionid){
      res.send({
        'error_code': 100, 'msg': '',
        'result_list': {}
      });
      return;
    }
    dbhelper.getUserById(openid, (status, result) => {
      if (status)
        res.send({
          'error_code': 200, 'msg': '',
          'result_list': {
            'user_name': result['user_name'],
            'avatar_url': result['avatar_url']
          }
        });
      else
        res.send({
          'error_code': 100, 'msg': '',
          'result_list': {}
        });
    })
  });
});

/**
 * 更新用户的头像
 */
router.post('/updateAvatarUrl', function (req, res) {
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid){
      res.send({ 'error_code': 100, 'msg': '' });
      return;
    }
    // console.log('openid:' + openid);
    let url = req.body.url;
    dbhelper.updateUser('avatar_url', url, openid, (status, result) => {
      if (status) res.send({ 'error_code': 200, 'msg': '' });
      else res.send({ 'error_code': 100, 'msg': result });
    })
  });
  
});

module.exports = router;
