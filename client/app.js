//app.js
App({
  config: {
    host: 'zhoucanzhendevelop.com',
    request_head: 'https://zhoucanzhendevelop.com',
    hot_topic_num : 6,
  },
  
  globalData:{
    
  },

  onLaunch: function (options) {
    /**
     * 登录用户，并将用户数据加入到数据库中，
     * 如果用户信息在数据库已经存在，则更新
     */
    function userLogin(userinfo) {
      if (userinfo == []) return false;
      wx.login({
        success(loginResult) {
          console.log('登录成功');
          wx.request({
            url: getApp().config.request_head + '/user/login',
            method: 'POST',
            data: {
              'code': loginResult.code,
              'userinfo': userinfo
            },
            success: function (res) {
              if (res.statusCode == 200) {
                console.log('发送请求成功啦！' + res.data);
                return true;
              }
            }
          })
        },
        fail(loginError) {
          console.log('微信登录失败，请检查网络状态');
          return false;
        }
      })
    }

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
              userLogin(res.userInfo);
            },
          })
        }
      }
    })
  },
});