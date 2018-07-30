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
 */
router.post('/login', function(req, res) {
  let code = req.body.code;
  let userinfo = JSON.parse(req.body.userinfo);
  let sessionid = req.header('session-id');
  let openid = '';

  let getOpenID = function (code) {
    request({
      'url': 'https://api.weixin.qq.com/sns/jscode2session',
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
        userinfo['openid'] = body.openid;
        // 然后插入表或者更新表数据
        dbhelper.insertOrUpdateUsers(userinfo, (result, errmsg) => {
          if (result) { //插入成功，则在redis里存储sessionid
            utils.generateRandom((random) => {
              console.log('随机生成sessionid：' + random);
              redishelper.storeValue(random, body.openid,
                (err) => {
                  if (err) console.log('redis 存储失败');
                  else console.log('redis存储成功');
                });
              res.send({ 'errorCode': 200, 'msg': '', 'sessionId': random });
            });
          } else res.send({ 'errorCode': 100, 'msg': errmsg, 'sessionId': '' });

          
        });
      }
    });
  }

  //如果传递过来sessionid，且redis里有存openid和sessionid，则直接获取
  if (sessionid){
    redishelper.getValue(sessionid, (value) => {
      console.log('redis获取key ' + sessionid + ':' + value);
      if (!value) { //如果redis里无法获取值，代表过期了，也要重新发送api请求
        getOpenID(code);
        return;
      }
      userinfo['openid'] = storeValue;
      dbhelper.insertOrUpdateUsers(userinfo, (result, errmsg) => {
        if (result) res.send({ 'errorCode': 200, 'msg': '', 'sessionId': sessionid });
        else res.send({ 'errorCode': 100, 'msg': errmsg, 'sessionId': sessionid });
      });
    })
  } else { //否则发送微信api请求
    getOpenID(code);
  }

  
  // // 先request获取唯一标识open_id
  // request({
  //   'url' : 'https://api.weixin.qq.com/sns/jscode2session',
  //   'method': 'GET',
  //   'qs': {
  //       appid: config.appId,
  //       secret: config.appSecret,
  //       js_code: code,
  //       grant_type: 'authorization_code'
  //     },
  //   'json': true
  //   }, 
  //   function (error, response, body) {
  //     if (!error && response.statusCode == 200) {
  //       // 然后插入表或者更新表数据
  //       dbhelper.insertOrUpdateUsers(
  //                 body.openid, 
  //                 userinfo.nickName, 
  //                 userinfo.avatarUrl,
  //                 userinfo.country,
  //                 userinfo.province,
  //                 userinfo.city,
  //                 parseInt(userinfo.gender), 0, (result, errmsg) => {
  //                   let sessionId = utils.generateRandom();
  //                   if (result) {
  //                     redishelper.storeValue(
  //                       sessionId, 
  //                       {'openid': body.openid, 'sessionid': body.sessionId}, 
  //                       (err) => {
  //                         if (err) console.log('redis 存储失败');
  //                         else console.log('redis存储成功');
  //                       });
  //                     res.send({ 'errorCode': 200, 'msg': '', 'sessionId': sessionId});
  //                   } else res.send({ 'errorCode': 100, 'msg': errmsg, 'sessionId': '' });
  //                 });
  //     }
  // });
});


module.exports = router;
