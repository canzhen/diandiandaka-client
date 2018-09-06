var qiniu = require('qiniuUploader.js');

const config = {
  'prefix': 'https://images.zhoucanzhendevelop.com/',
  'scaleAPI': '?imageView2/1/w/90/h/90/q/75|imageslim',
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
  // console.log(file);
  // console.log(key);
  // console.log(token);
  // console.log(getConfig());
  qiniu.upload(file, (res) => {
    console.log('上传图片成功，imgurl：' + res.imageURL);
    cb(true, res.imageURL);
  }, (error) => {
    console.log(error);
    if (error) {
      console.log('七牛上传图片失败....');
      cb(false, '');
    }
  }, {
    key: key,
    region: 'ECN',
    uptoken: token,
    uploadURL: 'https://upload.qiniup.com',
    domain: 'https://images.zhoucanzhendevelop.com'
  });

  // console.log('进入qiniuhelper，准备上传。');
  // wx.uploadFile({
  //   url: 'https://upload.qiniup.com',
  //   filePath: file,
  //   name: 'file',
  //   formData: {
  //     'token': token,//刚刚获取的上传凭证
  //     'key': key//这里是为文件设置上传后的文件名
  //   },
  //   success: function (r) {
  //     var data = r.data;//七牛会返回一个包含hash值和key的JSON字符串
  //     if (typeof data === 'string') data = JSON.parse(data.trim());//解压缩
  //     if (data.key) {//这里就可以直接使用data.key，文件已经上传成功可以使用了。如果是图片也可以直接通过image调用
  //       console.log(data.key);
  //     }
  //   },
  //   fail: function (res) {
  //     console.log(res)
  //   }
  // })
}

module.exports = {
  config, 
  upload
};
