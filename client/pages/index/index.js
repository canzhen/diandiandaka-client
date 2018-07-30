const helper = require('./helper.js');
const api = require('../../ajax/api.js');

Page({
  data: {
    user_openid: '', //用户唯一标识
    hot_topic_data: [], //热门卡片
    topic_name: '', //用户在输入框输入的卡片名称
    topic_url: '', //如果用户直接单击热门卡片，则图片的url会被记录下来
  },
  

  /**
   * “开始进步”button同时是用户单击之后要获取权限的按钮，
   * 此方法就是引导用户确认权限
   */
  bindGetUserInfo: function (e) {
    let topicname = this.data.topic_name;
    let topicurl = this.data.topic_url;
    if (e.detail.userInfo == undefined){ //用户拒绝了授权
      wx.showToast({
        title: '确定不授权？不授权无法保存您的数据喔~',
        icon: 'none',
        duration: 2000,
        success: function () {}
      })
    }else{ //用户同意授权
      helper.userLogin(e.detail.userInfo, (result) => {
        console.log('用户登录结果：' + result);
      });
      helper.navigateToNewTopicPage(topicname, topicurl);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从数据库中获取topic
    api.getRequest(
      '/topic/gettopic', 
      { 'limit_num': getApp().config.index_hot_topic_num },
      (res) => {
        if (res.errorCode == 200){
          this.setData({
            hot_topic_data: res.data
          });
        }else{
          wx.showToast({
            title: '提交失败..大爷饶命，小的这就去查看原因..',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/index/index',
            })
          }, 3000);
        }
      },
      (res) => {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }, 3000);
        console.log('[index] get hot topic data failed');
      });
  },

  /**
   * 当输入框的数据发生改变时，触发该函数
   */
  bindInputTopicChange: function(e){
    this.setData({
      'topic_name': e.detail.value
    });
  },


  /**
   * 选择某个热门卡片时所触发的函数
   */
  clickHotTopic: function(e){
    let topicname = e.currentTarget.dataset.selectedTopicName;
    let topicurl = e.currentTarget.dataset.selectedTopicUrl;
    this.setData({
      'topic_name': topicname,
      'topic_url': topicurl
    });
  },

});


