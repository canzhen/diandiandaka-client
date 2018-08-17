const CONF = {
  port: '3000',
  rootPathname: '',

  // 微信小程序 App ID
  appId: 'wx51edf73b7674cbc5',

  // 微信小程序 App Secret
  appSecret: 'e842baff35deee7206903b3b061383fc',

  // 是否使用腾讯云代理登录小程序
  useQcloudLogin: false,

  getUserInfoUrl: 'https://api.weixin.qq.com/sns/jscode2session',


  // 给用户推送模板消息的参数
  message: {
    getAccessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
    sendMessageUrl: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send',
    templateId: 'E_gRYCEJ2jXX0tWjKYV4FXpzfh3QJugCx-WtnuvSLTo', //提醒
  },



  /**
   * MySQL 配置
   */
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'diandiandaka',
    pwd: 'mysql123',
    char: 'utf8mb4',
    timezone: 'Hongkong'
  },

  /**
   * Redis缓存配置，默认过期时间为3小时
   * redis要设置得比小程序端的storage时间久（多一小时）
   * 的原因是，redis过期，storage却存在的情况，很难处理，
   * 所以还不如让redis久一点，storage过期的情况好处理，
   * 直接后端重新生成即可，这么做的缺点在于redis会有一些冗余数据
   */
  redis: {
    host: 'localhost',
    port: 6226,
    ttl: 60 * 60 * 3 //单位为秒，3小时
  },

  /**
   * 七牛cdn存储的配置
   */
  qiniu: {
    prefix: 'http://pcjzq4ixp.bkt.clouddn.com/',
    suffix: '?imageView2/1/w/90/h/90/q/75|imageslim',
    accessKey: 'Qo0sHRVPZBSNfD03wbzxMfXtRQb3BlIX0q1EKKV-',
    secretKey: 'El-eXq7MDFhVVtn8a3L4qDmEui0_OIocRB5nPSUj',
    bucket: 'diandiandaka-pics'
  },

  cos: {
    /**
     * 区域
     * @查看 https://cloud.tencent.com/document/product/436/6224
     */
    region: 'ap-guangzhou',
    // Bucket 名称
    fileBucket: 'wximg',
    // 文件夹
    uploadFolder: ''
  },

  // 微信登录态有效期
  wxLoginExpires: 7200
}

module.exports = CONF;
