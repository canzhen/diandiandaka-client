const api = require('../../ajax/api.js');
// const utils = require('../../vendor/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //卡片列表
    remind_time_list: [], //提醒时间
    form_id_list: [], //用于存储用户单击所产生的form_id
    time: '07:00', //选择时间是默认一开始显示的时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;
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
        let user_topic_list = res.result_list;
        if (user_topic_list.length == 0) {
          wx.showToast({
            title: '您好像还没有卡片喔~',
            icon: 'none'
          })
          return;
        }

        console.log(user_topic_list);
        that.setData({
          topic_list: user_topic_list
        });
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });
















    // 查看是否用户已经设置提醒某些卡片，
    // 如果已经设置，则直接显示出来
    // api.postRequest({
    //   'url': '/me/getRemindSettings',
    //   'data': [],
    //   'success': (res) => {
    //     if (res.error_code == 200 && res.result_list.length != 0) {
    //       let remind_info = res.result_list[0];
    //       // console.log(remind_info)
    //       let checked_topic_str = remind_info['topic_list'];
    //       if (checked_topic_str == '') return;
    //       that.getUserTopic(checked_topic_str, (status) => {
    //         if (status != 0) return;

    //         let topic_list = that.data.topic_list;
    //         let remind_time = remind_info['remind_time']
    //         // console.log(topic_list)

    //         for (let i in topic_list){
    //           if (checked_topic_str.indexOf(topic_list[i].topic_name) != -1){
    //             // 用户已经设置了该卡片需要
    //             console.log(111)
    //           }
    //         }






    //         let remind_time_list = [];
    //         // let remind_time = remind_info['remind_time'] ?
    //         //   remind_info['remind_time'] : '未设置时间';
    //         //设置微信提醒，只有一个时间
    //         if (remind_info['remind_method'] == 1){ 
    //           for (let i in that.data.topic_list)
    //             remind_time_list.push(remind_time)
    //         //设置短信提醒，有多个时间
    //         } else if (remind_info['remind_method'] == 2){
    //           remind_time_list = remind_info['remind_time'].split(',');
    //         }
    //         that.setData({
    //           checked_topic_str: checked_topic_str,
    //           remind_time_list: remind_time_list,
    //           is_remind_switch_on: true
    //         });
    //       });
    //     }
    //   }
    // });

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

        console.log(user_topic_list);

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


  /**
   * 设置打卡时间变化时触发的函数
   */
  bindRemindTimeChange: function(e){
    let index = e.currentTarget.dataset.index;
    let time = e.detail.value;
    let topic_list = this.data.topic_list;
    topic_list[index].remind_time = time;

    this.setData({
      topic_list: topic_list
    })
  },



  /**
   * 单击设置提醒时间
   */
  clickOnSetRemindTime: function(e){
    this.saveFormId(e.detail.formId);
  },



  /**
   * 保存设置
   */
  saveSettings: function (e) {
    let that = this;
    let formId = e.detail.formId;
    let remind_topic_list = [];

    for (let i in this.data.topic_list) {
      if (that.data.topic_list[i].checked)
        remind_topic_list.push(that.data.topic_list[i].topic_name)
    }

    console.log(remind_topic_list)

    // api.postRequest({
    //   'url': '/me/saveSettings',
    //   'data': {
    //     user_name: that.data.user_name,
    //     province: that.data.province,
    //     city: that.data.city,
    //     county: that.data.county,
    //     gender: that.data.gender,
    //     topic_list: remind_topic_list.toString(),
    //     remind_time: that.data.remind_time,
    //     form_id: formId
    //   },
    //   'success': (res) => {
    //     if (res && res.error_code != 200){
    //       console.log('保存用户设置失败');
    //       this.showFailToast();
    //       return;
    //     }
    //     console.log('保存用户设置成功');
    //     this.showSucceedToast(is_set_reminder);
    //   },
    //   'fail': (res) => {
    //     this.showFailToast();
    //     console.log('保存用户设置失败');
    //   },
    // });
  },
})