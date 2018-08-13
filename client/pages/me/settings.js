const api = require('../../ajax/api.js');
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
    province: '北京市',
    city: '市辖区',
    county: '东城区',
    is_check_area: false,
    gender: '', 
    radioItems: [
      { name: '男', value: '男'},
      { name: '女', value: '女' }
    ],
    topic_list: [], //该用户的topic列表
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
          scrollHeight: res.windowHeight - 200
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
   * 选择性别的按钮变化时触发的函数
   */
  radioChange: function(e){
    this.setData({
      gender: e.detail.value
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
          'url': '/userTopic/getTopicListByUserId',
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
  topicRemindChange: function(e){
    console.log(e.detail.value)
  },


  /**
   * 保存设置
   */
  saveSettings: function(e){
  }

})