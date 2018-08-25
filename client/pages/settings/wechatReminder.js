const api = require('../../ajax/api.js');
// const utils = require('../../vendor/utils.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //卡片列表
    form_id_list: [], //用于存储用户单击所产生的form_id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    // 查看是否用户已经设置提醒某些卡片，
    // 如果已经设置，则直接显示出来
    api.postRequest({
      'url': '/me/getRemindSettings',
      'data': [],
      'success': (res) => {
        if (res.error_code == 200 && res.result_list.length != 0) {
          let remind_info = res.result_list[0];
          // console.log(remind_info)
          let checked_topic_str = remind_info['topic_list'];
          if (checked_topic_str == '') return;
          that.getUserTopic(checked_topic_str, (status) => {
            if (status != 0) return;
            let remind_time = remind_info['remind_time'] ?
              remind_info['remind_time'] : '08:00';
            that.setData({
              checked_topic_str: checked_topic_str,
              remind_time: remind_time,
              is_remind_switch_on: true
            });
          });
        }
      }
    });
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
   * 获取该用户的卡片
   */
  getUserTopic: function (checked_topic_str, cb) {
    let that = this;
    api.postRequest({
      'url': '/topic/getUserTopic',
      'data': [],
      'showLoading': true,
      'success': (res) => { //成功
        if (res.error_code != 200) {
          console.log('从数据库中获取用户卡片信息失败');
          cb(1);
          return;
        }
        console.log('从数据库中获取用户卡片信息成功');
        let user_topic_list = res.result_list;
        if (user_topic_list.length == 0) {
          wx.showToast({
            title: '您好像还没有卡片喔~',
            icon: 'none'
          })
          return;
        }

        console.log(user_topic_list)
        // 将已经设置为要提醒的卡片打勾
        if (checked_topic_str != undefined &&
          checked_topic_str != '') {
          for (let i in user_topic_list) {
            if (checked_topic_str.indexOf(user_topic_list[i].topic_name) != -1)
              user_topic_list[i].checked = true;
            else
              user_topic_list[i].checked = false;
          }
        }
        that.setData({
          topic_list: user_topic_list
        });
        cb(0)
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });
  },




  /**
   * 用于保存formId的helper方法
   */
  saveFormId: function (formId) {
    console.log(formId);
    let form_id_list = this.data.form_id_list;
    form_id_list.push(formId);
    this.setData({
      form_id_list: form_id_list
    });
  },


})