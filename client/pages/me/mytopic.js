const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const numEachRow = 2; //每行3个

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //当前用户的所有卡片集合
    random_position_list:[], //卡片随机的位置
  },


  init: function(){
    let that = this;
    // // 根据当前卡片数来生成每一行图片的的下标
    // let createRowNum = function () {
    //   that.setData({
    //     topic_num_list: utils.getSubscriptByLength(that.data.topic_list.length, numEachRow)
    //   });
    // }

    let list = [];
    let generateRandomPos = function(l){
      wx.getSystemInfo({
        success: function(res) {
          let width = res.windowWidth;
          let height = res.windowHeight;

          wx.createSelectorQuery().selectAll('.me-lower-part-item').boundingClientRect((rects) => {
            console.log(rects)
            let item_height = rects[0].height;
            let item_width = rects[0].width;

            for (let i = 0; i < l; i++) {
              list.push({ 'x': utils.getRandom(0, width - item_width), 'y': utils.getRandom(0, height - item_height) });
            }
            that.setData({
              random_position_list: list
            });
            console.log(that.data.random_position_list)
          }).exec();

        },
      })

    }

    api.postRequest({
      'url': '/userTopic/getTopicListByUserId',
      'data': [],
      'showLoading': true,
      'success': (res) => { //成功
        // console.log(res)
        if (res.error_code != 200) {
          console.log('从数据库中获取用户卡片信息失败');
          return;
        }
        console.log('从数据库中获取用户卡片信息成功');
        this.setData({
          topic_list: res.result_list
        });
        generateRandomPos(res.result_list.length);
        // createRowNum();
        // console.log(res.result_list);
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init();
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


  longTapTopic: function() {
    console.log('长按……')
    this.setData({
      long_tap: true
    });
  },


  tapTopic: function() {
    if (!this.data.long_tap)
      console.log('单击……')
  },


  tapTopicEnd: function() {
    this.setData({
      long_tap: false
    });
  },
})