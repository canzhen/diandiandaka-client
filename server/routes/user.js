var express = require('express');
var request = require('request');
var config = require('../config.js');
var dbhelper = require('../helpers/dbhelper.js');
var qiniuhelper = require('../helpers/qiniuhelper.js');
var router = express.Router();


/**
 * 用户登录，获取唯一open_id
 */
router.post('/login', function(req, res) {
  // 先request获取唯一标识open_id
  request({
    'url' : 'https://api.weixin.qq.com/sns/jscode2session',
    'method': 'GET',
    'qs': {
        appid: config.appId,
        secret: config.appSecret,
        js_code: req.body.code,
        grant_type: 'authorization_code'
      },
    'json': true
    }, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var userinfo = req.body.userinfo;
        // 然后插入表或者更新表数据
        dbhelper.insertOrUpdateUsers(
                  body.openid, 
                  userinfo.nickName, 
                  userinfo.avatarUrl,
                  userinfo.country,
                  userinfo.province,
                  userinfo.city,
                  parseInt(userinfo.gender), 0, (result, errmsg) => {
                    if (result) res.send({'status': true, 'msg': ''});
                    else res.send({ 'status': true, 'msg': errmsg });
                  });

        req.session.openId = body.openid; //将userOpenId保存到session（redis）
        req.session.save();  //保存一下修改后的Session

        console.log(req.session);

        console.log('session已保存到本地：' + req.session.openId);
      }
  });
});


module.exports = router;
