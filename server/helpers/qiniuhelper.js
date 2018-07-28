var qiniu = require('qiniu');
var { qiniu: config} = require('../config.js');

function getToken(){
  //创建上传凭证之前，定义好鉴权对象mac
  var mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
  var options = {
    scope: bucket,
    expires: 7200 //2小时
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
}

module.exports = {
  getToken
};
