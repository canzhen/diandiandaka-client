const qiniuhelper = require('../../vendor/qiniuhelper.js');
const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const numEachRow = 2; //每行3个

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //用户的打卡数据
    topic_num_list: [], //用于存排列下标的数组

    user_name: '', //用户名（如果没设置就是微信名）
    avatar_url: '', //从数据库（本地缓存）中获取
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字
  },


  init: function(){

    let that = this;
    if (wx.getStorageSync('avatarUrl')){
      this.setData({
        avatar_url: wx.getStorageSync('avatarUrl'),
        is_reset_avatar: true
      });
    } else if (wx.getStorageSync('userName')) {
      this.setData({
        user_name: wx.getStorageSync('userName'),
        is_reset_name: true
      });
    }else{
      /* 获取用户的个性化头像和姓名 */
      api.postRequest({
        'url': '/user/getNameAvatar',
        'data': [],
        'success': (res) => {
          if (res.error_code == 200 && res.result_list != []) {
            let reslist = res.result_list;
            if (reslist == undefined) return;
            if (reslist['user_name'] || reslist['avatar_url']){
              this.setData({
                is_reset_name: !(reslist['user_name'] == false),
                is_reset_avatar: !(reslist['avatar_url'] == false),
                user_name: reslist['user_name'] ? reslist['user_name'] : '',
                avatar_url: reslist['avatar_url'] ? reslist['avatar_url'] : ''
              });
              wx.setStorageSync('avatarUrl', this.data.avatar_url);
              wx.setStorageSync('userName', this.data.user_name);
            }
          }
        }
      });
    }

    // 根据当前卡片数来生成每一行图片的的下标
    let createRowNum = function () {
      that.setData({
        topic_num_list: utils.getSubscriptByLength(that.data.topic_list.length, numEachRow)
      });
    }

    api.postRequest({
      'url': '/userTopic/getTopicListByUserId',
      'data': [],
      'showLoading': true,
      'success': (res) => { //成功
        console.log(res)
        if (res.error_code != 200) {
          console.log('从数据库中获取用户卡片信息失败');
          return;
        }
        console.log('从数据库中获取用户卡片信息成功');
        this.setData({
          topic_list: res.result_list
        });
        createRowNum();
        console.log(res.result_list);
      },
      'fail': (res) => { //失败
        console.log('从数据库中获取用户卡片信息失败');
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.me-upper-part').boundingClientRect((rects) => {
          rects.forEach((rect) => {
            that.setData({
              scrollHeight: res.windowHeight - rect.bottom - 80
            });
          })
        }).exec();
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
    if (!utils.getStorageSync('sessionId')) {
      utils.login((res) => {
        if (res) {
          console.log('login success');
          this.init();
        } else
          console.log('login fail');
      });
    } else {
      this.init();
    }
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
  
  },

  /**
   * 编辑个人资料
   */
  editPersonalData: function(){
    console.log('编辑个人资料');
  },


  /**
   * 用户单击头像，修改头像
   */
  changeAvatar: function () {
    let that = this;

    let showFailToast = function () {
      wx.showToast({
        title: '大哥饶命，上传失败...',
        icon: 'none',
        duration: 2000
      })
    };

    //用七牛删除之前的头像（不继续保存）
    let deletePreAvatar = function () {
      if (that.data.avatar_url) {
        let avatar_string = that.data.avatar_url;
        avatar_string.replace(qiniuhelper.config.scaleAPI, '');
        avatar_string.replace(qiniuhelper.config.prefix, '');
        api.postRequest({
          'url': '/qiniu/delete',
          'data': {
            'key': avatar_string
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

    let updateAvatarUrl = function (url) {
      api.postRequest({
        'url': '/user/updateAvatarUrl',
        'data': { 'url': url },
        'success': (res) => {
          wx.hideLoading()
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
        wx.showLoading({
          title: '更换头像中...',
        })
        let filepath = res.tempFilePaths[0];
        let filename = 'avatar/' + filepath.substring(filepath.indexOf('tmp/') + 4, filepath.lastIndexOf('.'));
        // 向服务器端获取token
        api.getRequest('/qiniu/getToken', {}, (res) => {
          if (res.error_code == 200) {
            deletePreAvatar(); //删除之前保存的头像，如果存在的话
            // 成功获取token之后，开始上传图片
            let token = res.token;
            console.log('成功获取token:' + token);
            qiniuhelper.upload(filepath, filename, token, (status, url) => {
              if (!status) { showFailToast(); return; }
              // 头像需要剪裁成正方形，所以需要加上特定api
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
})