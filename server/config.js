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

  /**
   * MySQL 配置，用来存储 session 和用户信息
   * 若使用了腾讯云微信小程序解决方案
   * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
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
   * Redis缓存配置，默认过期时间为24小时
   */
  redis: {
    host: 'localhost',
    port : 6379,
    ttl: 60 * 60 * 2 //单位为秒，2小时
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
