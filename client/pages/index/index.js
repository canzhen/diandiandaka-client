const helper = require('./helper.js');
const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');

Page({
  data: {
    user_openid: '', //用户唯一标识
    hot_topic_data: [], //热门卡片
    topic_name: '', //用户在输入框输入的卡片名称
    topic_url: '', //如果用户直接单击热门卡片，则图片的url会被记录下来
  },
  

  /**
   * 单击"开始进步"触发的函数
   */
  createNewTopic: function (e) {
    let topicname = this.data.topic_name;
    let topicurl = this.data.topic_url;
    utils.login((res) => {
      console.log(res);
      utils.setStorageSync('sessionId', res.sessionId, 1000 * 60 * 60 * 2); //session默认2小时过期
      helper.navigateToNewTopicPage(topicname, topicurl);
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从数据库中获取topic
    api.getRequest(
      '/topic/gettopic', 
      { 'limit_num': getApp().config.index_hot_topic_num },
      (res) => { //请求成功
        if (res.errorCode == 200){
          this.setData({
            hot_topic_data: res.data
          });
        }else{
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/index/index',
            })
          }, 3000);
        }
      },
      (res) => { //失败
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }, 1000);
        console.log('[index] get hot topic data failed');
      });
  },

  onShow: function(options){
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

})
