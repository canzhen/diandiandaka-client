const qiniuhelper = require('../../vendor/qiniuhelper.js');
const utils = require('../../vendor/utils.js');
const api = require('../../ajax/api.js');
const numEachRow = 4;

Page({
  data: {
    my_topic_data: [],
    my_topic_data_num: [],
    selected_id: -1, //用户单击打卡的id
    user_name: '', 
    avatar_url:'', //从本地缓存中获取
    is_reset_avatar: false, //默认用户没有修改头像
    is_reset_name: false, //默认用户没修改过名字

    show_modal: false, //是否弹出弹框
    modal_placeholder: '', //弹出框的默认字符串
    modal_todate_time: '', //弹出框要显示的今日日期时间
    word_left_num: 140, //微信默认textarea最多输入140字
    textarea_value: '', //textarea默认字
  },





  /* 页面加载函数 */
  onLoad() {
    // this.init();
  },



  /* 页面显示函数，tab切换回来也会调用 */
  onShow() {
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
   * 页面初始化，获取数据
   */
  init: function (ifShowLoading = true) {
    let that = this;
    /* 获取用户的个性化头像和姓名 */
    api.postRequest({
      'url': '/user/getNameAvatar',
      'data': [],
      'success': (res) => {
        if (res.error_code == 200 && res.result_list != []) {
          let reslist = res.result_list;
          if (reslist == undefined) return;
          if (reslist['user_name'] || reslist['avatar_url'])
            this.setData({
              is_reset_name: !(reslist['user_name'] == false),
              is_reset_avatar: !(reslist['avatar_url'] == false),
              user_name: reslist['user_name'] ? reslist['user_name'] : '',
              avatar_url: reslist['avatar_url'] ? reslist['avatar_url'] : ''
            });
          // console.log(this.data.is_reset_avatar);
          // console.log(this.data.avatar_url);
        }
      }
    });

    // 根据当前卡片数来生成每一行图片的的下标
    let createRowNum = function () {
      that.setData({
        my_topic_data_num: utils.getSubscriptByLength(that.data.my_topic_data.length, numEachRow)
      });
    }

    /* 获取当前用户的打卡信息 */
    api.postRequest({
      'url': '/userTopic/getTopicListByUserId',
      'data': [],
      'showLoading': ifShowLoading, 
      'success': (res) => { //成功
        if (res.error_code == 200) {
          console.log('获取用户打卡信息成功');
          let result_list = utils.filterDatedData(res.result_list);
          result_list.push({
            'topic_name': '添加新卡片\n\n\n',
            'topic_url': '/images/xinkapian.png',
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
    //过滤掉没有打卡的卡片，只剩下打过卡的卡片
    let changed_topic_list = utils.filterUnchangeData(this.data.my_topic_data);
    if (changed_topic_list.length == 0) return;
    console.log(changed_topic_list);
    api.postRequest({
      'url': '/topicCheck/check',
      'data': { 
        'changedTopicList': JSON.stringify(changed_topic_list)
      },
      'showLoading': false, 
      'success': (res) => {},
      'fail': (res) => {}
    });
  },


  /** 
   * 页面隐藏函数
   * 监听页面的隐藏，
   * 当从当前A页跳转到其他页面，那么A页面处于隐藏状态
   * */
  onHide: function(event){
    this.saveCheckData();
  },



  /**
   * 页面卸载函数
   * 监听页面的卸载，
   * 当前处于A页面，点击返回按钮时，则将是A页面卸载
   */
  onUnload: function(event){
    this.saveCheckData();
  },


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



  /**
   * 打卡功能
   */
  check: function(event) {
    let id = parseInt(event.currentTarget.dataset.idx);
    let data = this.data.my_topic_data[id];
    // 查看是否是空白栏，如果是，直接返回
    if (typeof data == 'undefined') return;
    // 查看是否是添加新卡片，如果是，就直接跳转到newtopic function
    if (data.insist_day == -1) return this.newtopic(event);


    // 查看是否之前单击过，如果单击过，则此次单击取消之前单击
    // 新增data_changed 是因为：同一天打过卡的，is_checked本身就为true，
    // 这样在save的时候，就又会被save一次
    let dataChangedData = 'my_topic_data[' + id + '].data_changed';
    let boolData = 'my_topic_data[' + id + '].is_checked';
    let insistData = 'my_topic_data[' + id + '].insist_day';
    let totalData = 'my_topic_data[' + id + '].total_day';
    let origin_is_checked = data.is_checked;
    let origin_insist_day = data.insist_day;
    let origin_total_day = data.total_day;
    console.log(data);

    if (origin_is_checked) {
      this.setData({
        [boolData]: false,
        [insistData]: origin_insist_day - 1,
        [totalData]: origin_total_day - 1
      });
      return;
    }

    if (data.if_show_log == 0) {
      console.log(-1);
      this.setData({
        [dataChangedData]: true,
        [boolData]: true,
        [insistData]: data['insist_day'] + 1,
        [totalData]: data['total_day'] + 1,
      });
    } else { //如果选择要弹框，则弹出框
      console.log(1);
      this.setData({
        selected_id: id,
        show_modal: true,
        modal_todate_time: utils.getFormateDatetimeEN(new Date()),
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


  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {},


  /**
   * 不再显示，隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      show_modal: false
    });
    //设置数据库中if_show_log为false，下次不再显示

  },


  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let id = this.data.selected_id;
    let data = this.data.my_topic_data[id];
    let dataChangedData = 'my_topic_data[' + id + '].data_changed';
    let boolData = 'my_topic_data[' + id + '].is_checked';
    let logData = 'my_topic_data[' + id + '].log';
    let insistData = 'my_topic_data[' + id + '].insist_day';
    let totalData = 'my_topic_data[' + id + '].total_day';
    this.setData({
      [dataChangedData]: true,
      [boolData]: true,
      [logData]: this.data.textarea_value,
      [insistData]: data['insist_day'] + 1,
      [totalData]: data['total_day'] + 1,
      textarea_value: '',
    });
    console.log(this.data.my_topic_data);
    this.hideModal();
  },



  /**
   * 对话框取消按钮点击事件
   */
  onNeverShow: function () {
    let that = this;
    //弹窗提示用户信息
    wx.showModal({
      title: '确认',
      content: '确认在打卡该卡片时不再弹出打卡日志吗？可在[我]->[设置]中随时打开',
      confirmText: "不再弹出",
      cancelText: "取消",
      success: function (res) {
        if (!res.confirm) return;
        console.log('用户确认不再弹出')
        let data = that.data.my_topic_data[that.data.selected_id];
        let topic_name = data.topic_name;
        let dataChangedData = 'my_topic_data[' + id + '].data_changed';
        // 设置当前弹出框为0
        that.setData({
          [dataChangedData]: true
        });
        that.hideModal();
      }
    });
  },


  /**
   * 输入框字数变化时触发的函数
   */
  inputChange: function(e){
    console.log(e.detail.value);
    this.setData({
      word_left_num: 140 - e.detail.value.length, //默认最多输入140
      textarea_value: e.detail.value
    });
  },

}); 