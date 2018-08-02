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
    helper.navigateToNewTopicPage(topicname, topicurl);
  },

  init: function(){
    // if (utils.getStorageSync('sessionId')) return;
    // 从数据库中获取topic
    api.getRequest(
      '/topic/gettopic',
      { 'limit_num': getApp().config.index_hot_topic_num },
      (res) => { //请求成功
        if (res.error_code == 200) {
          this.setData({
            hot_topic_data: res.data
          });
        } else {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.init();
  },

  onShow: function (options) {
    this.init();
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


  /**
   * 下拉刷新
   */
  onPullDownRefresh: function(e){
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.init(); //重新加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 800);
  }

})
