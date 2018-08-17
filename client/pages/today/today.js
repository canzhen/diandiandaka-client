const qiniuhelper = require('../../vendor/qiniuhelper.js');
const utils = require('../../vendor/utils.js');
const moment = require('../../vendor/moment.js');
const api = require('../../ajax/api.js');
const numEachRow = 4;

Page({
  data: {
    my_topic_data: [], //我的topic的数据
    my_topic_data_num: [], //用于布局的下标
    selected_id: -1, //用户单击打卡的id
    user_name: '', 
    avatar_url:'', //从数据库（本地缓存）中获取
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字

    show_modal: false, //是否弹出弹框
    modal_placeholder: '', //弹出框的默认字符串
    modal_todate_time: '', //弹出框要显示的今日日期时间
    word_left_num: 140, //微信默认textarea最多输入140字
    textarea_value: '', //textarea默认字
    form_id_list: [], //用于存储用户单击所产生的form_id
  },





  /* 页面加载函数 */
  onLoad() {
    let that = this;

    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.first-line-view').boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - rects[0].bottom - 80
          });
        }).exec();
      }
    });


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
  },



  /* tab来回切换时也会调用的function */
  onShow: function(){
    if (this.data.is_loaded){
      this.setData({
        is_loaded: false
      });
      return;
    }
    this.init();
  },

  /**
   * 页面初始化，获取数据
   */
  init: function (ifShowLoading = true) {
    let that = this;

    if (wx.getStorageSync('avatarUrl')) {
      this.setData({
        avatar_url: wx.getStorageSync('avatarUrl'),
        is_reset_avatar: true
      });
    }

    if (wx.getStorageSync('userName')) {
      this.setData({
        user_name: wx.getStorageSync('userName'),
        is_reset_name: true
      });
    }

    if (!wx.getStorageSync('avatarUrl') ||
      !wx.getStorageSync('userName')){

      /* 获取用户的个性化头像和姓名 */
      api.postRequest({
        'url': '/db/user/getNameAvatar',
        'data': [],
        'success': (res) => {
          if (res.error_code == 200 && res.result_list != []) {
            if (res.result_list == undefined) return;

            let reslist = res.result_list;
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



    // 根据当前卡片数来生成每一行图片的的下标
    let createRowNum = function () {
      that.setData({
        my_topic_data_num: utils.getSubscriptByLength(that.data.my_topic_data.length, numEachRow)
      });
    }

    /* 获取当前用户的打卡信息 */
    api.postRequest({
      'url': '/topic/getUserTopic',
      'data': [],
      'showLoading': ifShowLoading, 
      'success': (res) => { //成功
        if (res.error_code == 200) {
          console.log('获取用户打卡信息成功');
          let result_list = utils.filterDatedData(res.result_list);
          result_list.push({
            'topic_name': '添加新卡片\n',
            'topic_url': '/images/xinkapian.png',
            'insist_day': -1,
            'is_checked': false
          });
          this.setData({
            my_topic_data: result_list
          });
          createRowNum();
        } else console.log('获取用户打卡信息失败');
      },
      'fail': (res) => { //失败
        console.log('获取用户打卡信息失败');
      }
    });
  },




  /**
   * 保存到当前打卡数据到数据库
   */
  saveCheckData: function(){
    // 过滤掉没有变动的卡片，剩下变动的卡片
    let changed_topic_list = utils.filterUnchangeData(this.data.my_topic_data);
    if (changed_topic_list.length == 0) return;
    
    // 整理出打卡的卡片，和取消打卡的卡片
    let [topic_check_delete_str, topic_check_delete_list,    
         user_topic_update_reduce_list,user_topic_update_list,
         user_topic_insert_list] = 
         utils.formatCheckData(changed_topic_list);
    
    api.postRequest({
      'url': '/topic/check',
      'data': { 
        'topic_check_delete_str': topic_check_delete_str, 
        'topic_check_delete_list': topic_check_delete_list,
        'user_topic_update_list': user_topic_update_list,
        'user_topic_update_reduce_list': user_topic_update_reduce_list,
        'user_topic_insert_list': user_topic_insert_list,
      },
      'showLoading': false, 
      'success': (res) => {
        console.log('success')
      },
      'fail': (res) => {
        console.log('fail')
        console.log(res)}
    });
  },


  /** 
   * 页面隐藏函数
   * 监听页面的隐藏，
   * 当从当前A页跳转到其他页面，那么A页面处于隐藏状态
   * */
  onHide: function(event){
    this.saveCheckData();

    if (this.data.form_id_list.length == 0) return;
    console.log('I am hiding')
    console.log(this.data.form_id_list);
    utils.saveFormId(this.data.form_id_list);
    this.setData({
      form_id_list: []
    });
  },



  /**
   * 页面卸载函数
   * 监听页面的卸载，
   * 当前处于A页面，点击返回按钮时，则将是A页面卸载
   */
  // onUnload: function(event){
  //   this.saveCheckData();
  // },


  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.saveCheckData();
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.init(false);
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 800);
  },


  _check: function (id, data){
    let dataChangedData = 'my_topic_data[' + id + '].data_changed';
    let boolData = 'my_topic_data[' + id + '].is_checked';
    let lastCheckTimeData = 'my_topic_data[' + id + '].last_check_time';
    let lastCheckTimestampData = 'my_topic_data[' + id + '].last_check_timestamp';
    let insistData = 'my_topic_data[' + id + '].insist_day';
    let totalData = 'my_topic_data[' + id + '].total_day';

    this.setData({
      [dataChangedData]: true,
      [boolData]: true,
      [insistData]: data['insist_day'] + 1,
      [totalData]: data['total_day'] + 1,
      [lastCheckTimeData]: moment().format('YYYY-MM-DD'),
      [lastCheckTimestampData]: moment().format('HH:MM:ss'),
    });

    // 制作动画效果
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    });

    animation.rotate3d(0, 1, -0.5, 360).step()

    let setAnimationData = 'my_topic_data[' + id + '].animation';
    this.setData({
      [setAnimationData]: animation.export(),
    });
  },


  /**
   * 打卡功能
   */
  check: function(event) {
    this.saveFormId(event.detail.formId);
    let id = parseInt(event.currentTarget.dataset.idx);
    let data = this.data.my_topic_data[id];
    // 查看是否是空白栏，如果是，直接返回
    if (typeof data == 'undefined') return;
    // 查看是否是添加新卡片，如果是，就直接跳转到newtopic function
    if (data.insist_day == -1) return this.newtopic(event);


    // 新增data_changed 是因为：同一天打过卡的，is_checked本身就为true，
    // 这样在save的时候，就又会被save一次
    let dataChangedData = 'my_topic_data[' + id + '].data_changed'; 
    let boolData = 'my_topic_data[' + id + '].is_checked';
    let insistData = 'my_topic_data[' + id + '].insist_day';
    let totalData = 'my_topic_data[' + id + '].total_day';
    let origin_insist_day = data.insist_day;
    let origin_total_day = data.total_day;

    // 查看是否之前单击过，如果单击过，则此次单击取消之前单击
    if (data.is_checked) {
      wx.showModal({
        title: '确定删除',
        content: '你确定要取消今日的打卡吗？将连同您今日的打卡日志一并删除哟',
        showCancel: true,
        success: (res) => {
          if (res.confirm){
            this.setData({
              [dataChangedData]: true,
              [boolData]: false,
              [insistData]: origin_insist_day - 1,
              [totalData]: origin_total_day - 1
            });
            wx.showToast({
              title: '已删除今日打卡',
            })
          }
        },
      })
      return;
    }



    if (data.if_show_log == 0) {
      this._check(id, data);
    } else { //如果选择要弹框，则弹出框
      this.setData({
        selected_id: id,
        show_modal: true,
        // modal_todate_time: moment().format('YYYY-MM-DD HH:mm'),
        modal_placeholder: '今天' + data.topic_name + '有什么感想咩~',
      });
    }

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

    let updateAvatarUrl = function(url){
      api.postRequest({
        'url': '/db/user/updateAvatarUrl',
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
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {},


  /**
   * 不再显示，隐藏模态对话框
   */
  hideModal: function () {
    let id = this.data.selected_id;
    let data = this.data.my_topic_data[id];
    this._check(id, data);
    this.setData({
      show_modal: false
    });
  },


  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let id = this.data.selected_id;
    let data = this.data.my_topic_data[id];

    let logData = 'my_topic_data[' + id + '].log';
    this.setData({
      [logData]: this.data.textarea_value,
      textarea_value: '',
    });
    this.hideModal();
  },



  /**
   * 对话框取消按钮点击事件
   */
  onNeverShow: function () {
    let that = this;
    let updateDBNotShowLog = function (topic_name){
      api.postRequest({
        'url': '/topic/udpateColumn',
        'data': {
          'topic_name': topic_name,
          'column_name': 'if_show_log',
          'column_value': 0
        },
        'success': (res) => {
          if (res.error_code != 200){
            console.log('取消用户[' + topic_name + ']卡片的showlog失败T_T');
            return;
          }
          console.log('取消用户[' + topic_name + ']卡片的showlog成功');
          that.hideModal();
        },
        'fail': (res) => {
          console.log('取消用户[' + topic_name + ']卡片的showlog失败T_T');
        },
      });
    };


    //弹窗提示用户信息
    wx.showModal({
      title: '确认',
      content: '确认在打卡该卡片时不再弹出打卡日志吗？可在[我]->[设置]中随时打开',
      confirmText: "不再弹出",
      cancelText: "取消",
      success: function (res) {
        if (!res.confirm) return;
        let id = that.data.selected_id;
        let data = that.data.my_topic_data[id];
        let topic_name = data.topic_name;
        let notShowData = 'my_topic_data[' + id + '].if_show_log';

        that.setData({
          [notShowData]: 0
        });
        that._check(id, data);
        
        updateDBNotShowLog(topic_name);
      }
    });
  },


  /**
   * 输入框字数变化时触发的函数
   */
  inputChange: function(e){
    this.setData({
      word_left_num: 140 - e.detail.value.length, //默认最多输入140
      textarea_value: e.detail.value
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

}); 