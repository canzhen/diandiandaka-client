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
    // province: '北京市',
    // city: '市辖区',
    // county: '东城区',
    is_check_area: false,
    radioItems: [
      { name: '0', value: '男'},
      { name: '1', value: '女' }
    ],
    remind_time: '08:00',
    topic_list: [], //该用户的topic列表
    remind_topic_list: [], //该用户选择要提醒的topic列表
    is_remind_switch_on: false, //是否打开提醒的switch是否开着
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.topic-remind-oneline1').
        boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - 360
          });
        }).exec();
      }
    });

    if (wx.getStorageSync('userName')) {
      this.setData({
        user_name: wx.getStorageSync('userName'),
        is_reset_name: true
      });
      console.log(this.data.user_name)
    }


    if (!wx.getStorageSync('userName')){
      /* 获取用户的个性化头像和姓名 */
      api.postRequest({
        'url': '/db/user/getNameAvatar',
        'data': [],
        'success': (res) => {
          if (res.error_code == 200 && res.result_list.length!=0) {
            if (res.result_list == undefined) return;
            let reslist = res.result_list;
            if (reslist['user_name']) {
              that.setData({
                is_reset_name: !(reslist['user_name'] == false),
                user_name: reslist['user_name'] ? reslist['user_name'] : '',
              });
              wx.setStorageSync('userName', that.data.user_name);
            }
          }
        }
      });
    }




    // 查看是否用户已经设置了地区、性别
    // 如果有，则直接显示出来
    api.postRequest({
      'url': '/me/getUserInfo',
      'data': [],
      'success': (res) => {
        if (res.error_code == 200 && res.result_list.length != 0) {
          let user_info = res.result_list[0];
          let radioGenderItems = that.data.radioItems;
          let gender = user_info['gender'];
          if (gender != -1)
            radioGenderItems[gender].checked = true;
          
          that.setData({
            province: user_info['province'] ? user_info['province'] : '北京市',
            city: user_info['city'] ? user_info['city'] : '市辖区',
            county: user_info['county'] ? user_info['county'] : '海淀区',
            radioItems: radioGenderItems,
            gender: gender
          });
        }
      }
    });


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
          that.getUserTopic(checked_topic_str);
          that.setData({
            checked_topic_str: checked_topic_str,
            is_remind_switch_on: true,
            show_topic_panel: true
          });
        }
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
    let id = e.currentTarget.dataset.id;
    if (id == 666){//确定 
      this.setData({
        province: areaPickerItem.provinces[areaPickerItem.value[0]].name,
        city: areaPickerItem.citys[areaPickerItem.value[1]].name,
        county: areaPickerItem.countys[areaPickerItem.value[2]].name
      });
    }
    areaPicker.animationEvents(this, 200, false, 400);
  },

  
  //滑动事件
  areaPickerChange: function (e) {
    areaPicker.updateAreaData(this, 1, e);
    areaPickerItem = this.data.areaPickerItem;
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
   * 获取该用户的卡片
   */
  getUserTopic: function(checked_topic_str){
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
        // 将已经设置为要提醒的卡片打勾
        if (checked_topic_str != undefined && 
              checked_topic_str != ''){
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
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });
  },




  /**
   * 选择是否开关提醒的按钮变化时触发的函数
   */
  switchChange: function(e){
    if (e.detail.value){
      this.setData({
        show_topic_panel: true
      });
      //如果已经获取过一次，就不需要再发送请求了
      if (this.data.topic_list.length != 0) return;
      this.getUserTopic(this.data.checked_topic_str);
      
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

    let topic_list = this.data.topic_list;
    let index = e.currentTarget.dataset.index;

    if (e.detail.value.length != 0){ //选中
      topic_list[index].checked = true;
    } else {
      topic_list[index].checked = false;
    }

    this.setData({
      topic_list: topic_list
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
    let that = this;
    let formId = e.detail.formId;
    let remind_topic_list = [];

    for (let i in this.data.topic_list) {
      if (that.data.topic_list[i].checked)
        remind_topic_list.push(that.data.topic_list[i].topic_name)
    }

    let is_set_reminder = remind_topic_list.length != 0;

    api.postRequest({
      'url': '/me/saveSettings',
      'data': {
        user_name: that.data.user_name,
        province: that.data.province,
        city: that.data.city,
        county: that.data.county,
        gender: that.data.gender,
        topic_list: remind_topic_list.toString(),
        remind_time: that.data.remind_time,
        form_id: formId
      },
      'success': (res) => {
        if (res && res.error_code != 200){
          console.log('保存用户设置失败');
          this.showFailToast();
          return;
        }
        console.log('保存用户设置成功');
        this.showSucceedToast(is_set_reminder);
      },
      'fail': (res) => {
        this.showFailToast();
        console.log('保存用户设置失败');
      },
    });
  },


  showFailToast: function(){
    wx.showToast({
      title: '啊呀，好像出现了点问题，我错了😞',
      icon: 'none'
    })
  },

  showSucceedToast: function (is_set_reminder){
    if (is_set_reminder){
      wx.showModal({
        title: '温馨提示',
        content: '开启提醒之后，将于次日生效喔~',
        showCancel: false,
        success: (res) => {
          wx.navigateBack({})
        }
      })
    } else {
      wx.showToast({
        title: '设置保存成功',
      })
      setTimeout(function(){
        wx.navigateBack({})
      }, 2000);
    }
  },

})
