const utils = require('./vendor/utils.js');


//app.js
App({
  config: {
    host: 'zhoucanzhendevelop.com',
    request_head: 'https://zhoucanzhendevelop.com',
    index_hot_topic_num : 6,
  },
  
  globalData:{
    
  },


  /**
   * 用户首次打开小程序，触发 onLaunch（全局只触发一次）
   */
  onLaunch: function (options) {
    if (utils.getStorageSync('sessionId')) {
      wx.switchTab({
        url: '/pages/mytopic/mytopic',
      })
    }
  },



  /**
   * 小程序初始化完成后，触发onShow方法，监听小程序显示
   */
  onShow: function(options){
  },
});