var qiniu = require('qiniu-sdk-min.js');

/**
 * 获取七牛云上传图片的配置
 */
function getConfig(){
  var config = {
    useCdnDomain: true,
    region: qiniu.region.z1, //华北地区
    retryCount: 5 //重试次数，5
  };
  return config;
}


/**
 * 向七牛云上传图片
 * @param file : Blob对象，上传的文件
 * @param key : 文件资源名
 * @param token: 上传验证信息，前端通过接口请求后端获得
 * @param cb: 回调函数
 */
function upload(file, key, token, cb){
  var putExtra = {
    fname: "",
    params: {},
    mimeType: [] || null
  };
  var observable = qiniu.upload(file, key, token, putExtra, getConfig());
  var subscription = observable.subscribe(// 上传开始
  (next) => {}, 
  (error) => {
    if (error) cb({'status': false, 'avatarUrl':''})
  }, 
  (completeRes) => {
    // cb({ 'status': true, 'avatarUrl': completeRes.url })
    cb({ 'status': true, 'avatarUrl': '111' })
  }); 
  // subscription.unsubscribe(); // 上传取消
}

module.export = {
  upload
}