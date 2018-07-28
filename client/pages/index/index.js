import {
  checkTopic,
  updateTopic,
  insertTopic,
  getTopic
} from './helper'

Page({
  data: {
    user_openid: '', //用户唯一标识
    hot_topic_data: [], //热门卡片
  },
  
  bindGetUserInfo: function (e) {
    // console.log(e.detail.userInfo)
  },

  
  submittopic: function(e){
    if (!wx.getStorageSync('userInfo')) getUserInfo;
    let topicname = e.detail.value.topicname
    //如果输入框为空，则要提示需要输入字才能提交
    if (topicname == '') {
      wx.showModal({
        content: '需要输入卡片名称才能开始进步喔~',
        showCancel: false
      });
      return;
    }

    /* 查看该卡片是否存在，如果存在则更新卡片，人数加一；否则新增卡片 */
    checkTopic(topicname, updateTopic, function(){
      wx.navigateTo({
        url: '/pages/newtopic/newtopic?topic_name=' + topicname
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotTopicData();
  },


  /**
   * 从数据库中获取topic并根据参与人数排序
   */
  getHotTopicData: function(){
    getTopic(getApp().config.hot_topic_num, //limit number
            (status, result_list) => {
              if (!status){
                this.showGetHotTopicFailToast();
              }
              result_list.sort(function(a, b){
                return b['use_people_num'] - a['use_people_num'];
              });
              // console.log(result_list);
              this.setData({
                hot_topic_data: result_list
              });
            });
  },

  /**
   * 选择某个热门卡片时所触发的函数
   */
  clickHotTopic: function(e){
    let topicname = e.currentTarget.dataset.selectedTopicName;
    let topicurl = e.currentTarget.dataset.selectedTopicUrl;
    if (topicname == undefined) return;
    insertTopic(topicname, topicurl, (status) => {
      if (status){
        console.log('成功');
        wx.switchTab({
          url: '/pages/mytopic/mytopic',
        })
      }
    });
    
  },


  /**
   * 显示提交成功的toast
   */
  showSucceedToast: function () {
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
      success: function () {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }, 1000);
      }
    })
  },


  /**
   * 显示获取hot topic卡片失败
   */
  showGetHotTopicFailToast: function(){
    wx.showToast({
      title: '正在提取热门卡片',
      icon: 'loading',
      duration: 2000,
      success: function () {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }, 1000);
      }
    })
  }

});


