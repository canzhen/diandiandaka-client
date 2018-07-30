//app.js
App({
  config: {
    host: 'zhoucanzhendevelop.com',
    request_head: 'https://zhoucanzhendevelop.com',
    index_hot_topic_num : 6,
  },
  
  globalData:{
    
  },

  onLaunch: function (options) {

    //查看用户是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log('用户已经授权');
          if (wx.getStorageSync('userInfo')) return;
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              /**
               * {'nickName': '', 
               * 'avatarUrl':'', 
               * 'country': '', 
               * 'province':'', 
               * 'city': '', 
               * 'gender':''}
               */
              wx.setStorageSync('userInfo', res.userInfo);
            },
          })
        }
      }
    })
  },
});