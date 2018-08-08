const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const numEachRow = 2; //每行3个

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //用户的打卡数据
    topic_num_list: [], //用于存排列下标的数组
  },


  init: function(){

    let that = this;

    // 根据当前卡片数来生成每一行图片的的下标
    let createRowNum = function () {
      that.setData({
        topic_num_list: utils.getSubscriptByLength(that.data.topic_list.length, numEachRow)
      });
    }

    api.postRequest({
      'url': '/userTopic/getTopicListByUserId',
      'data': [],
      'showLoading': true,
      'success': (res) => { //成功
        console.log(res)
        if (res.error_code != 200) {
          console.log('从数据库中获取用户卡片信息失败');
          return;
        }
        console.log('从数据库中获取用户卡片信息成功');
        this.setData({
          topic_list: res.result_list
        });
        createRowNum();
        console.log(res.result_list);
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        // let height = res.windowHeight;
        wx.createSelectorQuery().selectAll('.me-upper-part').boundingClientRect((rects) => {
          rects.forEach((rect) => {
            that.setData({
              scrollHeight: res.windowHeight - rect.bottom - 80
            });
          })
        }).exec();
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!utils.getStorageSync('sessionId')) {
      utils.login((res) => {
        if (res) {
          console.log('login success');
          this.init();
        } else
          console.log('login fail');
      });
    } else {
      this.init();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 编辑个人资料
   */
  editPersonalData: function(){
    console.log('编辑个人资料');
  },
})