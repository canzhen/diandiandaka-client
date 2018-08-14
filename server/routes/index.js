const express = require('express');
const redishelper = require('../helpers/redishelper.js');
const qiniuhelper = require('../helpers/qiniuhelper.js');
const dbhelper = require('../helpers/dbhelper.js');
const utils = require('../helpers/utils.js');
const config = require('../config.js');
const request = require('request');
const router = express.Router();



/**
 * 用户登录
 * 登录其实就是一个在数据库中create user的过程，
 * 所以请求的header里带有sessionid，
 * 且sesisonoid在服务端redis没过期，
 * 那么没必要再在数据库create了，直接返回即。
 */
router.post('/login', function (req, res) {
  let code = req.body.code;
  let timezone = req.body.timezone;
  let sessionid = req.header('session-id');
  let openid = '';
  let that = this;
  let redis_ttl = config.redis.ttl;

  let regenerateRandomId = function (openid) {
    utils.generateRandom((random) => {
      redishelper.storeValue(random, openid, redis_ttl);
      res.send({ 'error_code': 200, 'msg': '', 'sessionId': random });
      return;
    });
  };

  // 如果sessionid存在且在服务端redis没过期，则直接返回
  if (sessionid) {
    redishelper.getValue(sessionid, (value) => {
      if (value) { //sessionid存在，且redis没过期，直接原装打包返回
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
        dbhelper.insert('user', 'user_id, timezone', 
          [body.openid, timezone],
          "ON DUPLICATE KEY UPDATE user_id='"+body.openid+
          "', timezone='"+timezone+"'",
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
        res.send({ 'error_code': 200, 'msg': '', 'sessionId': sessionid });
        return;
      } else { getOpenID(code); }
    })
  } else {
    getOpenID(code);
  }

});





module.exports = router;
