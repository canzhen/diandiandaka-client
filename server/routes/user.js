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
        userinfo['openId'] = body.openid;
        // 每次登录都要更新一次用户表
        dbhelper.insertOrUpdateUsers(
                  dbhelper.connectServer(), 
                  userinfo.openId, 
                  userinfo.nickName, 
                  userinfo.avatarUrl,
                  userinfo.country,
                  userinfo.province,
                  userinfo.city,
                  parseInt(userinfo.gender));
        req.session.userOpenId = userinfo.openId; //将userOpenId保存到session（redis）
      }
  });
});



/**
 * 用户上传头像
 */
router.post('/uploadAvatar', function (req, res) {
  console.log(req.files);
  console.log('I am here, in /user/uploadAvatar');
  res.send({'status': 0, 'avatarUrl': 111});
  // req.session.userAvatar = 'nicai.png';
  // console.log('测试session好不好使，session：' + req.session.userAvatar);
  // qiniuhelper.upload();
});



module.exports = router;
