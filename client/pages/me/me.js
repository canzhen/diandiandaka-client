const qiniuhelper = require('../../vendor/qiniuhelper.js');
const api = require('../../ajax/api.js');
const utils = require('../../vendor/utils.js');
const share_list = [
  {path: '1-yasuo.jpg',top: 70},
  {path: '2-yasuo.jpg',top: 50}
]
const BACKGROUND_PREFIX = 'https://images.zhoucanzhendevelop.com/share/background';
const BACKGROUND_SUFFIX = '?v=1111';
	


Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_list: [], //用户的打卡全部数据列表
    topic_name_list: [], //用户的卡片名列表
    selected_topic_idx: 0, //默认用户选择的卡片（用于分享）

    user_name: '', //用户名（如果没设置就是微信名）
    avatar_url: '', //从数据库（本地缓存）中获取
    background_url: '', //从七牛云端下载的背景图url
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字
    start_reset_user_name: false, //是否开始修改用户名（显示input）
    form_id_list: [], //用于存储用户单击所产生的form_id
  },


  init: function(){
    let that = this;

    if (wx.getStorageSync('avatarUrl')){
      this.setData({
        avatar_url: wx.getStorageSync('avatarUrl'),
        is_reset_avatar: true,
      });
    }

    if (wx.getStorageSync('userName')) {
      this.setData({
        user_name: wx.getStorageSync('userName'),
        is_reset_name: true,
      });
    }

    if (!wx.getStorageSync('avatarUrl') ||
      !wx.getStorageSync('userName')) {
      /* 获取用户的个性化头像和姓名 */
      api.postRequest({
        'url': '/user/getNameAvatar',
        'data': [],
        'success': (res) => {
          if (res.error_code == 200 && res.result_list != []) {
            let reslist = res.result_list;
            if (reslist == undefined) return;
            if (reslist['user_name'] || reslist['avatar_url']) {
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


    console.log(wx.getStorageSync('avatarUrl'));
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.setData({
      is_loaded: true
    });





    let idx = utils.getRandom(0, share_list.length - 1);
    let path = BACKGROUND_PREFIX +
      share_list[idx].path + BACKGROUND_SUFFIX;
    console.log('选中的分享图为:' + path);
    let that = this;

    that.setData({
      selected_random_idx: idx
    })


    /** 获取背景url */
    let getBackgroundUrl = function () {
      wx.getImageInfo({
        src: path,
        success: (res) => {
          let backgroundUrl = res.path;
          console.log('下载下来的background_url:' + backgroundUrl);
          that.setData({
            background_url: backgroundUrl
          });
        }
      })
    }


    /** 获取所有topic的使用人数 */
    let getAllTopic = function () {
      api.postRequest({
        'url': '/topic/getAllTopic',
        'data': [],
        'showLoading': false,
        'success': (res) => {
          if (res.error_code != 200) {
            console.log('从数据库中获取卡片使用人数信息失败');
            return;
          }

          console.log('从数据库中获取卡片使用人数信息成功');
          let topic_use_list = res.result_list;
          let topic_use_map = {};

          for (let i in topic_use_list)
            topic_use_map[topic_use_list[i].topic_name] =
              topic_use_list[i].use_people_num;

          that.setData({
            topic_use_map: topic_use_map
          })
          // cb(topic_use_map);
        },
        'fail': (res) => { //失败
          console.log('从数据库中获取卡片使用人数信息失败');
        }
      })
    }

    getBackgroundUrl();
    getAllTopic();
  },

  /* tab来回切换时也会调用的function */
  onShow: function () {
    if (this.data.is_loaded) {
      this.setData({
        is_loaded: false
      });
      return;
    }
    this.init();
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
          url: '/qiniu/delete',
          data: {
            'key': avatar_string
          },
          showLoading: false,
          success: (res) => {
            if (res.error_code == 200) console.log('删除之前的头像成功');
            else console.log('删除之前头像失败');
          },
          fail: (res) => {
            console.log('删除之前头像失败');
          }
        });
      }
    };

    let updateAvatarUrl = function (url) {
      api.postRequest({
        'url': '/user/updateColumn',
        'data': { 
          column_name: 'avatar_url',
          column_value: url
         },
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
              // 更新storage里的url
              wx.setStorageSync('avatarUrl', url);
              console.log('成功上传新头像！地址是：' + that.data.avatar_url);
            });
          } else { showFailToast(); return; }
        });
      }
    });
  },





  /**
   * 修改用户名
   */
  editUserName: function(){
    this.setData({
      show_modal: true
    });
  },

  redirectToMyTopic: function(e){
    this.saveFormId(e.detail.formId);
    wx.navigateTo({
      url: '/pages/me/mytopic',
    })
  },

  redirectToMyRank: function (e) {
    this.saveFormId(e.detail.formId);
    wx.navigateTo({
      url: '/pages/me/myrank',
    })
  },

  redirectToSettings: function(e){
    this.saveFormId(e.detail.formId);
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },


  /**
   * 分享打卡
   */
  shareCards: function(e){
    this.saveFormId(e.detail.formId);
  },



  /**
   * picker选择topic
   */
  bindSelectTopic: function(e){
    this.setData({
      selected_topic_idx: e.detail.value
    })
  },


  /**
   * 选择卡片时，保存form id
   */
  selectTopicSaveFormId: function(e){
    this.saveFormId(e.detail.formId);
  },


  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { },


  /**
   * 不再显示，隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      show_modal: false
    });
  }, 


  /**
   * 不在显示选择卡片的模态对话框
   */
  hideSelectTopicModal: function(){
    this.setData({
      show_select_topic_modal: false
    })
  },



  /**
   * 不再显示分享图片的模态对话框
   */
  hideShareModal: function () {
    this.setData({
      show_share_modal: false
    });
  },


  /**
   * 用户在input框输入
   * 新用户名时触发的函数
   */
  newUserNameInputChange: function(e){
    this.setData({
      new_username: e.detail.value
    });
  },


  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let that = this;
    let new_username = this.data.new_username;

    let updateUserName = function(){
      api.postRequest({
        'url': '/user/updateColumn',
        'data': {
          column_name: 'user_name',
          column_value: new_username
        },
        'success': (res) => {
          if (res.error_code != 200) {
            console.log('修改用户名失败');
            return;
          }
          console.log('修改用户名成功');
          showNewUserName();
          wx.setStorageSync('userName', new_username);
          wx.showToast({
            title: '修改用户名成功',
            icon: 'succeed'
          })
        },
        'fail': (res) => {
          console.log('修改用户名成功');
        }
      });
    }

    if (new_username == undefined || new_username == '') {
      wx.showModal({
        title: '内容为空',
        content: '您填写的' + this.data.modal_title + '为空' +
          '，您确定要修改咩？',
        success: (res) => {
          this.hideModal();
          if (res.cancel) return;
          changeColumn();
        }
      })
    }

    let showNewUserName = function () {
      that.setData({
        is_reset_name: true,
        user_name: new_username
      });
    };


    this.hideModal();
  },



  /**
   * 用户单击分享打卡时，先弹出获取用户信息界面
   */
  bindGetUserInfo: function (e) {
    let that = this;
    if (e.detail.userInfo != undefined){ //用户授权了
      let userInfo = e.detail.userInfo;
      if (!this.data.user_name)
        this.setData({
          user_name: userInfo.nickName
        })
      if (!this.data.avatar_url)
        this.setData({
          avatar_url: userInfo.avatarUrl,
          wx_avatar: true // 是否是微信自带的头像
        })
    }


    // 开始让用户选择要分享的卡片
    api.postRequest({
      url: '/topic/getUserTopic',
      data: {},
      success: (res) => {
        if (res.error_code != 200) {
          console.log('获取用户卡片列表失败');
          return;
        }
        let topic_name_list = [];
        for (let i in res.result_list)
          topic_name_list.push(res.result_list[i].topic_name);
        this.setData({
          topic_list: res.result_list,
          topic_name_list: topic_name_list,
          selected_topic_idx: 0,
        })

        this.setData({
          show_select_topic_modal: true
        })
      }
    })



    /** 获取头像url（名字） */
    let getAvatarUrl = function () {
      // 如果头像url为空，或者微信头像（因为没加到downloadfile现在无法画到画布上）
      if (!that.data.avatar_url){
        that.setData({
          avatar_url: ''
        })
        return;
      }

      wx.getImageInfo({
        src: that.data.avatar_url,
        success: (res) => {
          let avatarUrl = res.path; 
          that.setData({
            avatar_url: avatarUrl
          })
        }
      })
    }
    getAvatarUrl();
  },




  /**
   * 用户选择了某个卡片之后的操作
   */
  onConfirmSelectTopic: function () {

    let that = this;
    wx.showLoading({
      title: '图片生成中',
    })

    let startDrawing = function () {
      let topic_name = that.data.topic_name_list[that.data.selected_topic_idx];

      console.log('图片生成中');

      /** 获取系统宽度和高度 */
      let getSystemWidthHeight = function (cb) {
        wx.getSystemInfo({
          success: function (res) {
            let width = res.windowWidth * 0.8;
            let height = res.windowHeight * 0.75;

            cb(width, height);
          }
        })
      }

      getSystemWidthHeight((width, height) => {
        let topic_info = that.data.topic_list[that.data.selected_topic_idx];
        let rank = topic_info.rank;
        let total_num = that.data.topic_use_map[topic_name];
        let higher_rate = parseFloat((total_num - rank) / total_num * 100).toFixed(2);

        utils.drawShareImage('shareCanvas', that.data.background_url,
          that.data.user_name, that.data.avatar_url, topic_name,
          topic_info.total_day, higher_rate,
          share_list[that.data.selected_random_idx].top,
          width, height,
          () => {
            setTimeout(() => {
              that.setData({
                share_modal_width: width,
                share_modal_height: height,
                show_share_modal: true,
                show_select_topic_modal: false
              })
              wx.hideLoading();
            }, 5000)
          })
      })
    }
    
    if (this.data.topic_name_list.length == 0 ||
      !this.data.avatar_url || !this.data.background_url) {
      setTimeout(() => {
        startDrawing();
      }, 1000)
    }else{
      startDrawing();
    }

  },


  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },


  onCancelSelectTopic: function(){
    this.setData({
      show_select_topic_modal: false
    })
  },


  /**
   * 用于保存formId的helper方法
   */
  saveFormId: function (formId) {
    // console.log(formId);
    let form_id_list = this.data.form_id_list;
    form_id_list.push(formId);
    this.setData({
      form_id_list: form_id_list
    });
  },




  /** 
   * 页面隐藏函数
   * 监听页面的隐藏，
   * 当从当前A页跳转到其他页面，那么A页面处于隐藏状态
   * */
  onHide: function (event) {
    if (this.data.form_id_list.length == 0) return;
    utils.saveFormId(this.data.form_id_list);
    this.setData({
      form_id_list: []
    });
  },


  /**
   * 保存分享图到本地相册，引导分享
   */
  saveShareToLocal: function(){
    let that = this;
    utils.canvasToFile('shareCanvas', 
      that.data.share_modal_width, that.data.share_modal_height,
      (path) => {
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.showModal({
              title: '存图成功',
              content: '图片成功保存到相册了，去发圈噻~',
              showCancel: false,
              confirmText: '好哒',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                  that.hideShareModal()
                }
              }
            })
          }
        })
      })
  },
})