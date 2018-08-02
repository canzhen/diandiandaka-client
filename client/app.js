const utils = require('./vendor/utils.js');

//app.js
App({
  config: {
    host: 'zhoucanzhendevelop.com',
    index_hot_topic_num : 6,
  },
  
  globalData:{
    
  },


  /**
   * 用户首次打开小程序，触发 onLaunch（全局只触发一次）
   */
  onLaunch: function (options) {
    console.log('app onLaunch..');
    console.log('localstorage sessionid:' + utils.getStorageSync('sessionId'));
    if (!utils.getStorageSync('sessionId')) { //如果已经存好了sessionid则不需要重新获取
      console.log('重新登录');
      utils.login((res) => {
        console.log('login成功：');
        console.log(res);
      });
    }
  },



  /**
   * 小程序初始化完成后，触发onShow方法，监听小程序显示
   */
  onShow: function(options){
  },
});