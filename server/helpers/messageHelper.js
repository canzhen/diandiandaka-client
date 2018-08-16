const request = require('request');
const config = require('../config.js');
const redis = require('../helpers/redishelper.js');

/* get access token */
function getAccessToken(cb){
  redis.getValue('accessToken', (ans) => {
    if (!ans) requestAccessToken(cb)
    else cb(ans);
  });

  let requestAccessToken = function(cb){
    request({
      'url': config.message.getAccessTokenUrl,
      'method': 'GET',
      'qs': {
        appid: config.appId,
        secret: config.appSecret,
        grant_type: 'client_credential'
      },
      'json': true
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
         //让redis提前两小时过期，防止失效
        redis.storeValue('accessToken', body.access_token,
          body.expires_in - 60*60*2); 
        cb(body.access_token);
      } else cb(false);
    });
  };
}


/**
 * 给用户推送模板消息的接口
 */
function sendMessage(openid,formid, messageBody, cb){
  getAccessToken((access_token) => {
    if (!access_token) {
      console.log('无法获取access_token，推送消息失败');
      cb(false, '无法获取access_token');
    }

    console.log(access_token)
    request({
      'url': config.message.sendMessageUrl + 
                '?access_token=' + access_token,
      'method': 'POST',
      'body': {
        touser: openid,
        template_id: config.message.templateId,
        form_id: formid,
        page: '/pages/today/today', //用户单击之后自动跳到今日打卡
        data: messageBody,
      },
      'json': true
    }, (error, response, body) => {
      if (!error && response.statusCode == 200 && 
            response.body.errcode==0) {
        cb(true, '')
      } else cb(false, response.body);
    });

  });
}


module.exports = {
  sendMessage
};
