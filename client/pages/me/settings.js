const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
var areaPicker = require('../../vendor/area-picker/picker.js')
var areaPickerItem = {};


Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaPickerItem: {
      show: false
    },
    user_name: '',
    gender: -1, 
    province: '北京市',
    city: '市辖区',
    county: '东城区',
    is_check_area: false,
    radioItems: [
      { name: '0', value: '男'},
      { name: '1', value: '女' }
    ],
    remind_time: '08:00',
    topic_list: [], //该用户的topic列表
    remind_topic_list: [], //该用户选择要提醒的topic列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight - 100
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var that = this;
    //请求数据
    areaPicker.updateAreaData(that, 0, e);
  },


  //点击选择城市按钮显示picker-view
  translate: function (e) {
    areaPicker.animationEvents(this, 0, true, 400);
  },


  //隐藏picker-view
  hiddenFloatView: function (e) {
    areaPicker.animationEvents(this, 200, false, 400);
  },

  
  //滑动事件
  bindChange: function (e) {
    areaPicker.updateAreaData(this, 1, e);
    areaPickerItem = this.data.areaPickerItem;
    this.setData({
      province: areaPickerItem.provinces[areaPickerItem.value[0]].name,
      city: areaPickerItem.citys[areaPickerItem.value[1]].name,
      county: areaPickerItem.countys[areaPickerItem.value[2]].name
    });
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 输入新的用户名的框修改时触发的函数
   */
  usernameInputChange: function(e){
    this.setData({
      user_name: e.detail.value
    });
  },

  /**
   * 选择性别的按钮变化时触发的函数
   */
  radioChange: function(e){
    this.setData({
      gender: parseInt(e.detail.value)
    });
  },


  /**
   * 选择是否开关提醒的按钮变化时触发的函数
   */
  switchChange: function(e){
    if (e.detail.value){
      if (this.data.topic_list.length == 0){
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
            that.setData({
              topic_list: res.result_list,
              // show_topic_panel: true
            });
          },
          'fail': (res) => { //失败
            console.log('从数据库中获取用户卡片信息失败');
          }
        });
      }
      this.setData({
        show_topic_panel: true
      });
    }else{
      this.setData({
        show_topic_panel: false
      });
    }
  },


  /**
   * 开启是否提醒的卡片checkbox变化时触发的函数
   */
  topicRemindChange: function (e) {
    let remind_topic_list = this.data.remind_topic_list;
    let topic_name = e.currentTarget.dataset.topicName;

    if (e.detail.value.length != 0){ //选中
      remind_topic_list.push(topic_name);
    }else{
      // delete remind_topic_list[topic_name];
      let idx = remind_topic_list.indexOf(topic_name);
      remind_topic_list.splice(idx, 1);
    }

    this.setData({
      remind_topic_list: remind_topic_list
    });
  },


  /**
   * 用户选择提醒时间所触发的函数
   */
  bindTimeChange: function(e){
    let time = e.detail.value;
    this.setData({
      remind_time: time
    });
  },


  /**
   * 保存设置
   */
  saveSettings: function(e){
    // utils.updateFormId(e.detail.formId);
    let formId = e.detail.formId;

    console.log(formId)
    
    let that = this;
    api.postRequest({
      'url': '/me/saveSettings',
      'data': {
        user_name: that.data.user_name,
        province: that.data.province,
        city: that.data.city,
        county: that.data.county,
        gender: that.data.gender,
        topic_list: that.data.remind_topic_list.toString(),
        remind_time: that.data.remind_time,
        form_id: formId
      },
      'success': (res) => {
        if (res && res.error_code != 200){
          console.log('保存用户设置失败');
          return;
        }
        console.log('保存用户设置成功');
      },
      'fail': (res) => {
        console.log('保存用户设置失败');
      },
    });
  }

})