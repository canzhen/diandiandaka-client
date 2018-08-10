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
    // 制作动画效果
    let animation = wx.createAnimation({
      duration: 6000,
      timingFunction: 'ease-in-out',
    });

    let createRandomPos = function (l, xLimit, yLimit) {
      let randompos_list = [];
      for (let i = 0; i < l; i++) {
        randompos_list.push({
          'x': utils.getRandom(0,xLimit),
          'y': utils.getRandom(0,yLimit)
        });
      }
      that.setData({
        random_position_list: randompos_list,
        // scrollHeight: height
      });
    };

    let createAnimation = function (l, limit) {
      let animation_list = [];
      for (let i = 0; i < l; i++) {
        animation_list.push(getAnimationData(
          utils.getRandom(0, limit),
          utils.getRandom(0, limit),
          utils.getRandom(0, limit),
          utils.getRandom(0, limit),
          utils.getRandom(0, limit),
          utils.getRandom(0, limit),
        ));
      }
      that.setData({
        animation_list: animation_list,
      });
    };

    let getAnimationData = function (x1, y1, z1, x2, y2, z2) {
      animation.translate3d(x1, y1, z1).step().translate3d(x2, y2, z2).step();
      return animation.export();
    }


    let generateRandomPos = function(l){
      wx.getSystemInfo({
        success: function(res) {
          let width = res.windowWidth;
          let height = res.windowHeight;
          // 设置scrollheight以及卡片随机位置
          wx.createSelectorQuery().selectAll('.movable-item').boundingClientRect((rects) => {
            let item_height = rects[0].height;
            let item_width = rects[0].width;
            createRandomPos(l, width-item_width, height-item_height);
            createAnimation(l, 50);
            console.log(that.data.animation_list)
          }).exec();
        },
      })
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
        generateRandomPos(res.result_list.length);
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
  },


  tapTopic: function() {
    console.log('单击……')
  },


  tapTopicEnd: function() {
  },
})