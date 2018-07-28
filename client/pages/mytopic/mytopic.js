var numEachRow = 4;
var qiniuSDK = require('../../vendor/qiniu-sdk-min.js');

Page({
  data: {
    my_topic_data: [
      {
        'name': '跑步',
        'insist_day': 8,
        'image_url': '/images/paobu.png',
        'is_checked' : false
      }, {
        'name': '早睡',
        'insist_day': 2,
        'image_url': '/images/zaoshui.png',
        'is_checked': false
      }, {
        'name': '减肥',
        'insist_day': 7,
        'image_url': '/images/jianfei.png',
        'is_checked': false
      }, {
        'name': '吃早餐',
        'insist_day': 19,
        'image_url': '/images/chizaocan.png',
        'is_checked': false
      }, {
        'name': '清晨一杯水',
        'insist_day': 13,
        'image_url': '/images/qingchenyibeishui.png',
        'is_checked': false
      }, {
        'name': '单反记录美好生活',
        'insist_day': 10,
        'image_url': '/images/camera.png',
        'is_checked': false
      }, {
        'name': '健身',
        'insist_day': 2,
        'image_url': '/images/jianshen.png',
        'is_checked': false
      }, {
        'name': '骑自行车',
        'insist_day': 2,
        'image_url': '/images/zixingche.png',
        'is_checked': false
      }, {
        'name': '添加新卡片',
        'image_url': '/images/xinkapian.png',
        'is_checked': false
      }],
    my_topic_data_num: [],
    avatarPath: wx.getStorageSync('userInfo').avatarUrl, //从本地缓存中获取
  },


  /* 方法部分 */
  onLoad(){
    // 动态创建my_topic_data_num作为分行下标
    var l = this.data.my_topic_data.length,
        r = l / numEachRow, c = numEachRow;

    var temp_topic_data_num = new Array();
    for (var r1 = 0; r1 < r; r1++){
      temp_topic_data_num[r1] = new Array();
      for (var c1 = 0; c1 < c; c1++)
        temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    }

    // 获取当前用户的打卡信息
    

    this.setData({
      my_topic_data_num: temp_topic_data_num
    });
  },

  /**
   * 打卡功能
   */
  check: function(event) {
    let id = parseInt(event.currentTarget.dataset.idx);
    let data = this.data.my_topic_data[id];
    // 查看是否是空白栏，如果是，直接返回
    if (typeof data == 'undefined') return;
    // 查看是否是添加新卡片，如果是，就直接跳转到newtopic function
    if (data.insist_day == null) return this.newtopic(event);
    // 查看是否之前单击过，如果单击过，则此次单击取消之前单击
    let origin_is_checked = data.is_checked;
    let origin_insist_day = parseInt(data.insist_day);
    if (origin_is_checked) {
      origin_is_checked = false;
      origin_insist_day -= 2;
    } else origin_is_checked = true;
    
    let boolData = 'my_topic_data[' + id + '].is_checked';
    let intData = 'my_topic_data[' + id + '].insist_day';

    this.setData({
      [boolData]: origin_is_checked,
      [intData]: origin_insist_day + 1
    });

    let msg = origin_is_checked ? 
              '打卡成功，您已坚持' + data.name +
              parseInt(origin_insist_day + 1) + '天' : 
              '取消打卡成功' ;

    wx.showModal({
      content: msg,
      showCancel: false,
      success: function (res) { }
    });
  },
  
  /**
   * 添加新卡片
   */
  newtopic: function(event){
    wx.navigateTo({
      url: '/pages/newtopic/newtopic',
    })
  },

  /**
   * 修改头像
   */
  changeAvatar: function () {
    console.log('点击选择图片');

    // wx.request({
    //   url: getApp().config.request_head + '/user/uploadAvatar',
    //   method: 'POST'
    // })

    


    self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let filepath = res.tempFilePaths[0];
        // 向服务器端获取token
        wx.request({
          url: getApp().config.request_head + '/qiniu/getToken',
          method: 'GET',
          success: function(res){
            if (res.statusCode == 200 && res.data.status == 0){
              
            }else{
              wx.showToast({
                title: '大哥饶命，上传失败...',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
        self.setData({
            avatarPath: res.tempFilePaths
        });
        console.log('成功上传新头像！地址是：' + self.data.avatarPath);
      }
    });
  },

}); 