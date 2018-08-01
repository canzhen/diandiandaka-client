const qiniuhelper = require('../../vendor/qiniuhelper.js');
const utils = require('../../vendor/utils.js');
const api = require('../../ajax/api.js');
const numEachRow = 4;

Page({
  data: {
    my_topic_data: [
      {
        'topic_name': '跑步',
        'insist_day': 8,
        'topic_url': '/images/paobu.png',
        'is_checked' : false
      }, {
        'topic_name': '早睡',
        'insist_day': 2,
        'topic_url': '/images/zaoshui.png',
        'is_checked': false
      }, {
        'topic_name': '减肥',
        'insist_day': 7,
        'topic_url': '/images/jianfei.png',
        'is_checked': false
      }, {
        'topic_name': '吃早餐',
        'insist_day': 19,
        'topic_url': '/images/chizaocan.png',
        'is_checked': false
      }, {
        'topic_name': '清晨一杯水',
        'insist_day': 13,
        'topic_url': '/images/qingchenyibeishui.png',
        'is_checked': false
      }, {
        'topic_name': '单反记录美好生活',
        'insist_day': 10,
        'topic_url': '/images/camera.png',
        'is_checked': false
      }, {
        'topic_name': '健身',
        'insist_day': 2,
        'topic_url': '/images/jianshen.png',
        'is_checked': false
      }, {
        'topic_name': '骑自行车',
        'insist_day': 2,
        'topic_url': '/images/zixingche.png',
        'is_checked': false
      }, {
        'topic_name': '添加新卡片',
        'topic_url': '/images/xinkapian.png',
        'is_checked': false
      }],
    my_topic_data_num: [],
    user_name: '', 
    avatar_url:'', //从本地缓存中获取
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字
  },





  /* 方法部分 */
  onLoad(){

    /* 动态创建my_topic_data_num作为分行下标 */
    var l = this.data.my_topic_data.length,
        r = l / numEachRow, c = numEachRow;

    var temp_topic_data_num = new Array();
    for (var r1 = 0; r1 < r; r1++){
      temp_topic_data_num[r1] = new Array();
      for (var c1 = 0; c1 < c; c1++)
        temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    }

    /* 获取用户的个性化头像和姓名 */
    api.postRequest({
      'url': '/user/getNameAvatar',
      'data': [],
      'success': (res) => {
        if (res.error_code == 200 && res.result_list != []) {
          // console.log('getNameAvatar: ');
          // console.log(res.result_list);
          let reslist = res.result_list;
          if (reslist == undefined) return;
          if (reslist['user_name'] || reslist['avatar_url'])
            this.setData({
              is_reset_name: !(reslist['user_name'] == false),
              is_reset_avatar: !(reslist['avatar_url'] == false),
              user_name: reslist['user_name'] ? reslist['user_name'] : '',
              avatar_url: reslist['avatar_url'] ? reslist['avatar_url'] : ''
            });
        }
      }
    });
    

    
    /* 获取当前用户的打卡信息 */
    

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
   * 用户单击头像，修改头像
   */
  changeAvatar: function () {
    let that = this;

    let showFailToast = function(){
      wx.showToast({
        title: '大哥饶命，上传失败...',
        icon: 'none',
        duration: 2000
      })
    };

    //用七牛删除之前的头像（不继续保存）
    let deletePreAvatar = function(){
      if (that.data.avatar_url) {
        api.postRequest({
          'url': '/qiniu/delete',
          'data': {
            'key': that.data.avatar_url
          },
          'showLoading': false,
          'success': (res) => {
            if (res.error_code == 200) console.log('删除之前的头像成功');
            else console.log('删除之前头像失败');
          },
          'fail': (res) => {
            console.log('删除之前头像失败');
          }
        }); 
      }
    };

    let updateAvatarUrl = function(url){
      api.postRequest({
        'url': '/user/updateAvatarUrl',
        'data': {'url': url},
        'success': (res) => {
          if (res.error_code == 200) 
            console.log('更新数据库里的avatar_url字段成功');
          else
            console.log('更新数据库里的avatar_url字段失败');
        },
        'fail': (res) => {
          console.log('更新数据库里的avatar_url字段失败');
        }
      });
    }

    // 弹出选择图片的框
    wx.chooseImage({
      count: 1, // 允许选择的图片数
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let filepath = res.tempFilePaths[0];
        let filename = filepath.substring(filepath.indexOf('tmp/') + 4, filepath.lastIndexOf('.'));
        // 向服务器端获取token
        api.getRequest('/qiniu/getToken', {}, (res) => {
          if (res.error_code == 200) {
            deletePreAvatar(); //删除之前保存的头像，如果存在的话
            // 成功获取token之后，开始上传图片
            let token = res.token;
            console.log('成功获取token:' + token);
            qiniuhelper.upload(filepath, filename, token, (status, url) => {
              if (!status) { showFailToast(); return; }
              url += qiniuhelper.config.scaleAPI;
              // 设置当前显示的头像为上传到七牛的图片url
              that.setData({
                avatar_url: url,
                is_reset_avatar: true
              });
              // 更新数据库里的avatar_url字段
              updateAvatarUrl(url);
              console.log('成功上传新头像！地址是：' + that.data.avatar_url);
            });
          } else { showFailToast(); return; }
        });
      }
    });
  },

}); 