const qiniu = require('qiniu');
const { qiniu: config} = require('../config.js');
// 鉴权对象mac
const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
const bucketManager = new qiniu.rs.BucketManager(mac, new qiniu.conf.Config());


/**
 * 获取token
 */
function getToken(){
  var options = {
    scope: config.bucket,
    expires: 7200 //2小时
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
}

/**
 * 删除空间中的文件
 * @param key: 文件名
 */
function deleteImage(key, cb) {
  key = key.replace(config.prefix, '');
  key = key.replace(config.suffix, '');
  console.log('delete key: ' + key);
  bucketManager.delete(config.bucket, key, 
    function (err, respBody, respInfo){
    if (err) {
      console.log(err);
      cb(false, err.toString());
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
      cb(true, '');
    }
  });
}




// var publicBucketDomain = 'https://pcjzq4ixp.bkt.clouddn.com';
// var publicDownloadUrl =
//       bucketManager.publicDownloadUrl(
//       publicBucketDomain, 'share/background1.jpg');

// console.log(publicDownloadUrl)



module.exports = {
  getToken,
  deleteImage
};
