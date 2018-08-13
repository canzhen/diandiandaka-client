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
    county: '东城区'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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