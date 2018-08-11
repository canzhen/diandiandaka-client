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
      duration: 4000,
      timingFunction: 'ease-in-out',
    });

    let createRandomPos = function (l, xLimit, yLimit) {
      let randompos_list = [];
      for (let i = 0; i < l/2; i++) {
        randompos_list.push({
          'x': utils.getRandom(0, xLimit / 2),
          'y': utils.getRandom(0, yLimit / 2)
        });
      }
      for (let i = l / 2; i <= l; i++) {
        randompos_list.push({
          'x': utils.getRandom(xLimit / 2, xLimit),
          'y': utils.getRandom(yLimit / 2, yLimit)
        });
      }
      that.setData({
        random_position_list: randompos_list,
      });

      console.log(that.data.random_position_list)
    };

    let createAnimation = function (l, xlimit, ylimit, zlimit) {
      let animation_list = [];
      for (let i = 0; i < l; i++) {
        animation_list.push(getAnimationData(
          utils.getRandom(-xlimit, xlimit),
          utils.getRandom(-ylimit, ylimit),
          utils.getRandom(-zlimit, zlimit),
        ));
      }
      that.setData({
        animation_list: animation_list,
      });
      // console.log(animation_list)
    };

    let getAnimationData = function (x1, y1, z1) {
      animation.translate3d(x1, y1, z1).step();
      return animation.export();
    }


    let generateRandomPos = function(l){
      wx.getSystemInfo({
        success: function(res) {
          let width = res.windowWidth;
          let height = res.windowHeight;
          that.setData({
            scrollWidth: width,
            scrollHeight: height
          });
          // 设置scrollheight以及卡片随机位置
          wx.createSelectorQuery().selectAll('.movable-item').boundingClientRect((rects) => {
            let item_height = rects[0].height;
            let item_width = rects[0].width;
            createRandomPos(l, width - item_width, height - item_height); 
            createAnimation(l, 20, 40, 50);
            setInterval(function () {
              createAnimation(l, 10, 10, 50);
            }, 4000);
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


  /**
   * 单击卡片
   */
  tapOnTopic: function (e) {
    let data = this.data.topic_list[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '/pages/me/edittopic?topic_name='+data.topic_name+
        '&start_date=' + data.start_date + 
        '&end_date=' + data.end_date + 
        '&topic_url=' + data.topic_url 
    })
  }, 


  tapTopicEnd: function() {
  },
})