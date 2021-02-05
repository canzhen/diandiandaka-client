const helper = require('./helper.js');
const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const MAX_HOT_TOPIC_NUM = 8;

Page({
  data: {
    user_openid: '', //用户唯一标识
    hot_topic_data: [], //热门卡片
    topic_name: '', //用户在输入框输入的卡片名称
    topic_url: '', //如果用户直接单击热门卡片，则图片的url会被记录下来
  },
  

  init: function(ifShowLoading = true){
    // 返回时的卡片名称应该清空
    this.setData({
      topic_name: ''
    }); 
    // if (utils.getStorageSync('sessionId')) return;
    // 从数据库中获取topic
    api.postRequest({
      'url': '/topic/getAllTopic',
      'data': { 
        'limit_num': MAX_HOT_TOPIC_NUM
      },
      'showLoading': ifShowLoading,
      'success': (res) => { //请求成功
        if (res.error_code == 200) {
          this.setData({
            hot_topic_data: res.result_list
          });
        }else {
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/index/index',
            })
          }, 3000);
        }
      }, 
      'fail': (res) => { //失败
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }, 1000);
        console.log('[index] get hot topic data failed');
      }
    });
  },



  /**
   * 分享转发给朋友
   */
  onShareAppMessage: (res) => {
    if (res.from === 'button') {
      console.log("来自页面内转发按钮");
      console.log(res.target);
    } else {
      console.log("来自右上角转发菜单")
    }

    return {
      title: '点点小打卡',
      path: '/pages/index/index',
      imageUrl: "/images/1selected.jpg",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();

    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        // let height = res.windowHeight;
        wx.createSelectorQuery().selectAll('.second-line-view').boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - rects[0].bottom - 40
          });
        }).exec();
      }
    });

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

    
    this.setData({
      is_loaded: true
    });
  },


  /* tab来回切换时也会调用的function */
  onShow: function () {
    if (this.data.is_loaded) {
      this.setData({
        is_loaded: false
      });
      return;
    }
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
  clickHotTopic: function (e) {
    let topicname = e.currentTarget.dataset.selectedTopicName;
    let topicurl = e.currentTarget.dataset.selectedTopicUrl;
    helper.navigateToNewTopicPage(topicname, topicurl);
  },

  /**
   * 单击"开始进步"触发的函数
   */
  createNewTopic: function (e) {
    let topicname = this.data.topic_name;
    let topicurl = this.data.topic_url;

    if (topicname.length == 0){
      wx.showToast({
        title: '你好像啥都没输？',
        icon: 'none'
      })
      return;
    }

    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥\\\\……&*（）——|{}【】‘；：”“'。，、？]");
    for (var i = 0; i < topicname.length; i++) {
      if (pattern.test(topicname.substr(i, 1))) {
        wx.showToast({
          title: '好像有非法字符诶',
          icon: 'none'
        })
        return;
      }
    }

    helper.navigateToNewTopicPage(topicname, topicurl);
  },



  /**
   * 下拉刷新
   */
  onPullDownRefresh: function(e){
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.init(false); //重新加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 800);
  },



  /**
   * 退出该界面会触发的方法
   */
  onHide: function(){
  },

})
