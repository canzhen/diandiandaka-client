const utils = require('../../vendor/utils');
const api = require('../../ajax/api.js');
const moment = require('../../vendor/moment.js');
const qiniuhelper = require('../../vendor/qiniuhelper.js');
const numEachRow = 5;

Page({
  data: {
    icon_data_list: [], //可供选择的topic图标
    icon_name_num: [],
    topic_name: '',
    topic_url: '', //topic图片的url
    start_date: '',
    end_date: '永不结束',
    topic_count_phase: '', 
    topic_count_unit: '', 
    pre_end_date: '', //在取消永不结束checkbox时，就把之前选好的end_date再放上去
    has_special_character: false, //计划名称中是否包含特殊字符
  },



  /**
   * 初始化
   */
  init: function (options) {
    let showFailToast = function () {
      wx.showToast({
        title: '好像出了点错~',
        icon: 'loading',
        duration: 1000
      })
    };

    api.postRequest({
      'url': '/topic/getAllTopicUrl',
      'data': {},
      'showLoading': true,
      'success': (res) => {
        if (res.error_code == 200) {
          let if_show_log = false;
          if (options.if_show_log && options.if_show_log == 1) 
            if_show_log = true;
          this.setData({
            icon_data_list: res.result_list,
            icon_name_num: utils.getSubscriptByLength(res.result_list.length, numEachRow),
            topic_name: options.topic_name ? options.topic_name : '',
            topic_url: options.topic_url ? options.topic_url : '',
            start_date: options.start_date ? options.start_date : '',
            end_date: options.end_date ? options.end_date : '',
            if_show_log: if_show_log,
            topic_count_phase: options.topic_count_phase ? 
                        options.topic_count_phase : '',
            topic_count_unit: options.topic_count_unit ? 
                        options.topic_count_unit : ''
          });
          // 必须在设置完scroll-view相关高度之后设置scroll-into-id才有效
          this.setData({
            scroll_into_id: 'chosen'
          });
        } else showFailToast();
      },
      'fail': (res) => { showFailToast(); }
    });


  },

  setScrollHeight: function () {
    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        // let height = res.windowHeight;
        wx.createSelectorQuery().selectAll('.pick-icon-text').boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - rects[0].bottom -
              res.windowHeight * 0.1 - 30
          });
        }).exec();
      }
    });
  },

  onLoad: function (options) {
    options = (options == undefined || !options) ? {} : options;
    let that = this;
    this.setScrollHeight();
    this.init(options);
  },

  onShow: function () {
  },


  /**
   * 单击图标触发的函数
   */
  checkIcon: function (event) {
    let id = parseInt(event.currentTarget.dataset.idx);
    let data = this.data.icon_data_list[id];
    // 查看是否是空白栏，如果是，直接返回
    if (typeof data == 'undefined') return;

    this.setData({
      selected_icon_num: id,
      topic_url: event.currentTarget.dataset.url
    });
  },


  /**
   * 开始日期选择器变化所触发的函数
   */
  bindStartDateChange: function (e) {
    this.setData({
      start_date: e.detail.value
    });
  },

  /**
   * 结束日期选择器变化所触发的函数
   */
  bindEndDateChange: function (e) {
    this.setData({
      end_date: e.detail.value,
    });
  },

  /**
   * 输入计划名称时触发的函数
   */
  bindTopicChange: function (e) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
    var inputName = e.detail.value;
    if (pattern.test(inputName)) {
      wx.showToast({
        title: '不要输入特殊字符哟~',
        icon: 'none',
        duration: 1000
      })
      this.setData({
        has_special_character: true
      });
    } else {
      this.setData({
        has_special_character: false
      });
    }
  },


  /**
   * 提交数据
   */
  submitForm: function (event) {
    let value = event.detail.value;
    // 检查数据是否完整
    if (!value.input_topic_name) {
      this.showReminderAlert('好像忘了填计划名称哟~');
      return;
    }

    //检查计划名称中是否包含特殊字符
    if (this.data.has_special_character) {
      this.showReminderAlert('计划名称中包含特殊字符，请删掉再提交，谢谢~');
      return;
    }
    if (!value.end_date) value.end_date = '永不结束';

    //检查日期是否漏选（开始和结束日期一样的话）
    if (value.start_date === value.end_date) {
      this.showReminderAlert('开始日期和结束日期一样喔，确定吗？');
      return;
    }
    if (!this.data.topic_url) {
      this.showReminderAlert('随便选一个图标就好啦~');
      return;
    }

    console.log("topic name是：" + value.input_topic_name + 
      "\n所选择的图像url是：" + this.data.topic_url +
      "\n开始日期是：" + value.start_date +
      "\n结束日期是：" + value.end_date);



    let that = this;

    // 更新卡片信息
    api.postRequest({
      'url': '/topic/update',
      'data': {
        original_topic_name: this.data.topic_name,
        topic_name: value.input_topic_name,
        topic_url: this.data.topic_url,
        start_date: value.start_date,
        end_date: value.end_date,
        if_show_log: this.data.if_show_log ? 1 : 0,
        topic_count_phase: value.input_topic_count_phase,
        topic_count_unit: value.input_topic_count_unit
      },
      'success': (res) => {
        console.log(res.error_code);
        if (res.error_code == 101)
          that.showFailToast('这个卡片名字好像你用过喔！换个名字吧~');
        else if (res.error_code == 102 || res.error_code == 103) {
          utils.login((res) => { });
          that.showFailToast('好像出了点问题，可以再提交一次咩~');
        } else if (res.error_code == 100)
          that.showFailToast('提交失败..大爷饶命，小的这就去查看原因..');
        else if (res.error_code == 200){
          that.showSucceedToast();
        }
      },
      'fail': (res) => {
        console.log('update topic 信息失败');
      }
    });

  },


  /**
   * 删除卡片
   */
  deleteTopic: function(e){ 
    wx.showModal({
      title: '确认删除',
      content: '您确认要删除该卡片吗？删除卡片将同时删除打卡记录',
      showCancel: true,
      success: (res) => {
        if (res.cancel) return;

        api.postRequest({
          'url': '/topic/delete',
          'data': {
            topic_name: this.data.topic_name
          },
          'success': (res) => {
            if (res.error_code != 200) {
              console.log('删除失败');
              return;
            }
            console.log('删除成功');
            wx.navigateBack();
          },
          'fail': (res) => {
            console.log('删除失败');
          }
        });
      }
    })
  },


  // 显示提示输入完整信息的toast
  showReminderAlert: function (alertMsg) {
    wx.showModal({
      content: alertMsg,
      showCancel: false,
      success: function (res) {
        if (res.confirm) console.log('用户在提示之后点击确定。');
      }
    });
  },


  // 显示提交成功的toast
  showSucceedToast: function () {
    wx.showToast({
      title: '修改卡片成功！',
      icon: 'success',
      duration: 2000,
      success: function () {
        setTimeout(function () {
          wx.navigateBack({})
        }, 2000);
      }
    })
  },


  // 显示提交失败的toast
  showFailToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 上传自定义图标
   */
  uploadIcon: function () {

    let that = this;

    let showFailToast = function () {
      wx.showToast({
        title: '大哥饶命，上传失败...',
        icon: 'none',
        duration: 2000
      })
    };

    let insertNewTopicUrl = function (url) {
      api.postRequest({
        'url': '/topic/insertTopicUrl',
        'data': { 'url': url },
        'success': (res) => {
          if (res.error_code == 200)
            console.log('在topic_url里新增图片url成功');
          else
            console.log('在topic_url里新增图片url失败');
        },
        'fail': (res) => {
          console.log('在topic_url里新增图片url失败');
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
          title: '上传中',
        })
        let filepath = res.tempFilePaths[0];
        let filename = 'topic/' + filepath.substring(filepath.indexOf('tmp/') + 4, filepath.lastIndexOf('.'));
        // 向服务器端获取token
        api.getRequest('/qiniu/getToken', {}, (res) => {
          if (res.error_code == 200) {
            // 成功获取token之后，开始上传图片
            let token = res.token;
            console.log('成功获取token:' + token);
            qiniuhelper.upload(filepath, filename, token, (status, url) => {
              if (!status) { showFailToast(); return; }
              let old_data_list = that.data.icon_data_list;
              old_data_list.push(url);
              that.setData({
                icon_data_list: old_data_list,
                icon_name_num: utils.getSubscriptByLength(old_data_list.length, numEachRow)
              });
              // 更新数据库里的avatar_url字段
              insertNewTopicUrl(filename);
              wx.hideLoading();
              console.log('成功上传新头像！地址是：' + that.data.icon_data_list);
            });
          } else { showFailToast(); return; }
        });
      }
    });
  },




  /**
   * 卡片计数单位修改
   */
  bindTopicCountUnitChange: function(e){
    this.setData({
      ifEditTopicCount: true
    })
  },


  /**
   * 是否弹出打卡日志修改
   */
  bindSwitchLogChange: function(e){
    this.setData({
      if_show_log: e.detail.value
    })
  },
});