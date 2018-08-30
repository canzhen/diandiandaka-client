const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //排名列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    api.postRequest({
      'url': '/topic/getUserTopic',
      'data': [],
      'showLoading': true,
      'success': (res) => { //成功
        if (res.error_code != 200) {
          console.log('从数据库中获取用户卡片信息失败');
          return;
        }
        console.log('从数据库中获取用户卡片信息成功');

        // 获取总人数
        api.postRequest({
          'url': '/topic/getAllTopic',
          'data': [],
          'showLoading': false,
          'success': (res) => {
            console.log('从数据库中获取卡片使用人数信息成功');
            let user_topic_list = this.data.topic_list;
            let topic_use_list = res.result_list;
            let topic_use_map = {};
            console.log(res)

            for (let i in topic_use_list)
              topic_use_map[topic_use_list[i].topic_name] = 
                    topic_use_list[i].use_people_num;



            for (let i in user_topic_list) {
              let rank = user_topic_list[i].rank;
              let total = topic_use_map[user_topic_list[i].topic_name];
              console.log(rank, total)
              user_topic_list[i].higher_rate = 
                      ((total-rank) / total * 100).toFixed(2);
            }
            this.setData({
              topic_list: user_topic_list
            })
          },
          'fail': (res) => { //失败
            console.log('从数据库中获取卡片使用人数信息失败');
          }
        })



        this.setData({
          topic_list: res.result_list
        });
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
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
  
  }
})