var helper = require('./helper.js');

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
    this.getHotTopicData();
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
   * 从数据库中获取topic并根据参与人数排序
   */
  getHotTopicData: function(){
    helper.getTopic(getApp().config.hot_topic_num, //limit number
        (status, result_list) => {
          if (!status){
            this.showGetHotTopicFailToast();
          }
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
    this.setData({
      'topic_name': topicname,
      'topic_url': topicurl
    });
    // if (topicname == undefined) return;
    // helper.insertTopic(topicname, topicurl, (status) => {
    //   if (status){
    //     console.log('成功');
    //     wx.switchTab({
    //       url: '/pages/mytopic/mytopic',
    //     })
    //   }
    // });
    
  },


  /**
   * 显示提交成功的toast
   */
  // showSucceedToast: function () {
  //   wx.showToast({
  //     title: '提交成功',
  //     icon: 'success',
  //     duration: 2000,
  //     success: function () {
  //       setTimeout(function () {
  //         wx.navigateTo({
  //           url: '/pages/index/index',
  //         })
  //       }, 1000);
  //     }
  //   })
  // },


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


