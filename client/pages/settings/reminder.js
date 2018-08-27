const api = require('../../ajax/api.js');
const moment = require('../../vendor/moment.js');
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
    country_code: '', //国家号
    phone_number: '', //电话号码
    delBtnWidth: 220,//删除按钮宽度单位（rpx）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      country_code: options.country_code,
      phone_number: options.phone_number
    })


    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
        console.log(res.windowHeight)
      }
    });


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
        
        for (let i in user_topic_list) {
          user_topic_list[i].txtStyle = 'left:0rpx;'
          let dated = false;
          if (user_topic_list[i].end_date != '永不结束' &&
              moment(user_topic_list[i].end_date, 'YYYY-MM-DD')
               < moment()){
            dated = true;
          }
          user_topic_list[i].dated = dated;
        }
        console.log(user_topic_list)
        that.setData({
          topic_list: user_topic_list
        });
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });


    this.initEleWidth(); // 初始化删除按钮的位置
  },


  /**
   * 初始化删除按钮的宽度位置
   */
  initEleWidth: function () {
    let delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },


  /**
   * 获取元素自适应后的实际宽度
   */
  getEleWidth: function (w) {
    let real = 0;
    try {
      let res = wx.getSystemInfoSync().windowWidth;
      let scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
    }
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
    topic_list[index].checked = true;

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
   * 设置提醒方式，微信或短信
   */
  setRemindMethod: function(e){
    let remind_method = e.currentTarget.dataset.method;
    let country_code = this.data.country_code;
    let phone_number = this.data.phone_number;
    if (remind_method == 2 && (phone_number == undefined ||
          !phone_number)){
      wx.showToast({
        title: '您没设置手机号码，无法进行短信提醒~',
        icon: 'none'
      })
      return;
    }

    if (country_code != undefined && country_code != '86') {
      wx.showToast({
        title: '目前短信提醒只支持国内手机号喔~',
        icon: 'none'
      })
      return;
    }


    let index = e.currentTarget.dataset.topicIndex;
    let topic_list = this.data.topic_list;
    topic_list[index].checked = true;
    topic_list[index].remind_method = remind_method;
    this.setData({
      topic_list: topic_list
    })
  },



  /**
   * 保存设置
   */
  saveSettings: function (e) {
    let that = this;
    let formId = e.detail.formId;
    let value_list = [];

    console.log(this.data.topic_list)

    for (let i in this.data.topic_list) {
      if (!that.data.topic_list[i].checked) continue;
      value_list.push(that.data.topic_list[i].topic_name)
      value_list.push(that.data.topic_list[i].remind_time)
    }



    for (let i in this.data.topic_list) {
      if (!that.data.topic_list[i].checked) continue;
      value_list.push(that.data.topic_list[i].topic_name)
      value_list.push(that.data.topic_list[i].remind_method)
    }


    if (value_list.length == 0){
      this.showSucceedToast();
      return;
    }

    let l = (value_list.length / 2) / 2; //checked topic的数量

    let columnMap = {
      remind_time:{
        condition_column: 'topic_name',
        condition_num: l
      },
      remind_method: {
        condition_column: 'topic_name',
        condition_num: l
      }
    }

    api.postRequest({
      'url': '/topic/saveTopicRemindSettings',
      'data': {
        column_map: columnMap, 
        value_list: value_list
      },
      'success': (res) => {
        if (res && res.error_code != 200){
          console.log('保存用户提醒设置失败');
          this.showFailToast();
          return;
        }
        console.log('保存用户提醒设置成功');
        this.showSucceedToast();
      },
      'fail': (res) => {
        this.showFailToast();
        console.log('保存用户提醒设置失败');
      },
    });
  },


  showSucceedToast: function(){
    wx.showModal({
      title: '设置成功',
      content: '提醒设置成功，将于次日生效~',
      showCancel: false
    })
  },



  showFailToast: function () {
    wx.showToast({
      title: '啊哦，保存设置失败，我错了😞 可以重试一下咩~',
      icon: 'none'
    })

    // setTimeout(() => {
    //   wx.navigateBack({})
    // }, 2000)
  },


  touchStart:function(e){
    if(e.touches.length==1){
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      });
    }
  },



  /**
    * 计算滑动角度
    * @param {Object} start 起点坐标
    * @param {Object} end 终点坐标
    */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y

    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  touchMove:function(e){
    if(e.touches.length==1){

      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let topic_list = this.data.topic_list;

      if (topic_list[index].remind_time == '') return;

      //手指  起始点位置与移动期间的差值
      let disX = this.data.startX - e.touches[0].clientX;
      let disY = this.data.startY - e.touches[0].clientY;
      let delBtnWidth = this.data.delBtnWidth;
      let txtStyle = "";
      let angle = this.angle(
        { X: this.data.startX, Y: this.data.startY }, 
        { X: disX, Y: disY });

      if (Math.abs(angle) > 30) return;

      if (disX == 0 || disX < 0){//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0px";
      }else if(disX > 0 ){ //移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-"+disX+"px";
        if(disX >= delBtnWidth){
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-"+delBtnWidth+"px";
        }
      }

      topic_list[index].txtStyle = txtStyle;

      //更新列表的状态
      this.setData({
        topic_list: topic_list
      });
    }

  },

 

  touchEnd:function(e){
    if(e.changedTouches.length==1){
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let topic_list = this.data.topic_list;

      if (topic_list[index].remind_time == '') return;


      //手指移动结束后水平位置
      let endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      let disX = this.data.startX - endX;
      let delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      let txtStyle = disX > delBtnWidth/2 ? "left:-"+delBtnWidth+"px":"left:0px";

      topic_list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        topic_list: topic_list
      });
    }
  },


  /**
   * 删除卡片
   */
  deleteTopic: function(e){
    this.saveFormId(e.detail.formId);

    let index = e.target.dataset.index;
    let topic_list = this.data.topic_list;

    //移除列表中下标为index的项
    topic_list[index].remind_time = '';
    topic_list[index].remind_method = -1;
    topic_list[index].txtStyle = 'left:0;';

    //更新列表的状态
    this.setData({
      topic_list: topic_list
    });
  }
  
})