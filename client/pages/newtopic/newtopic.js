import {
  login,
  getFullDateSlash,
  setStorageSync

} from '../../vendor/utils'
const api = require('../../ajax/api.js');
const numEachRow = 5;

Page({
  data: {
    icon_data: [
      '/images/fuqi.png', '/images/cake.png', '/images/guozhi.png',
      '/images/saozhou.png', '/images/huatong.png', '/images/cat.png',
      '/images/dog.png', '/images/zixingche.png', '/images/camera.png', 
      '/images/medicine.png', '/images/shufa.png', '/images/paobu.png', 
      '/images/jianshen.png', '/images/jianfei.png',  '/images/yuedu.png', 
      '/images/chizaocan.png', '/images/qingchenyibeishui.png',
      '/images/zaoqi.png', '/images/zaoshui.png'],
    icon_name_num: [],
    // selected_icon_num: -1,
    topic_name: '',
    topic_url: '', //topic图片的url
    start_date: getFullDateSlash(new Date()),
    end_date: getFullDateSlash(new Date()),
    pre_end_date: '', //在取消永不结束checkbox时，就把之前选好的end_date再放上去
    // never_repeat: false, //永不结束的checkbox是否选中
    has_special_character: false, //计划名称中是否包含特殊字符
  },


  /* 方法部分 */
  onLoad: function (options) {
    //动态创建icon_name_num作为分行下标
    var l = this.data.icon_data.length,
        r = l / numEachRow,
        c = numEachRow;
    
    var temp_icon_data_num = new Array();
    for (var r1 = 0; r1 < r; r1++) {
      temp_icon_data_num[r1] = new Array();
      for (var c1 = 0; c1 < c; c1++){
        if (r1 * numEachRow + c1 >= l) break;
        temp_icon_data_num[r1][c1] = r1 * numEachRow + c1;
      }
    }
    
    this.setData({
      icon_name_num: temp_icon_data_num,
      topic_name: options.topic_name ? options.topic_name : '',
      topic_url: options.topic_url ? options.topic_url : '',
    });
  },


  /**
   * 单击图标触发的函数
   */
  checkIcon: function (event) {
    let id = parseInt(event.currentTarget.dataset.idx);
    let data = this.data.icon_data[id];
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
      'start_date': e.detail.value
    });
  },

  /**
   * 结束日期选择器变化所触发的函数
   */
  bindEndDateChange: function (e) {
    this.setData({
      'end_date': e.detail.value
    });
  },

  /**
   * 输入计划名称时触发的函数
   */
  bindTopicChange: function(e) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
    var inputName = e.detail.value;
    if (pattern.test(inputName)){
      wx.showToast({
        title: '不要输入特殊字符哟~',
        icon: 'none',
        duration: 1000
      })
      this.setData({
        'has_special_character': true
      });
    }else{
      this.setData({
        'has_special_character': false
      });
    }
  },

  /**
   * 永不结束checkbox单击所触发的函数
   */
  bindNeverRepeat: function(e) {
    if (e.detail.value.length != 0){
      this.setData({
        pre_end_date: this.data.end_date, //把当前end_date保存到pre
        end_date: '永不结束' //之后设置当前end_date为永不结束
      });
    } else {
      this.setData({ //如果用户取消选择'永不结束'，则重置为之前所选择的时间
        end_date: this.data.pre_end_date
      });
    }
  },


  /**
   * 提交数据
   */
  submitForm: function(event){
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

    if (value.end_date == getFullDateSlash(new Date())) {
      this.showReminderAlert('好像忘记选结束日期啦？');
      return;
    }

    //检查日期是否漏选（开始和结束日期一样的话）
    if (value.start_date === value.end_date){
      this.showReminderAlert('开始日期和结束日期一样喔，确定吗？');
      return;
    }
    if (!this.data.topic_url) {
      this.showReminderAlert('随便选一个图标就好啦~');
      return;
    }

    console.log("topic name是：" + value.input_topic_name + 
      "\n selected id 是：" + this.data.selected_icon_num + 
      "\n所选择的图像url是：" + this.data.topic_url + 
      "\n开始日期是：" + value.start_date + 
      "\n结束日期是：" + value.end_date);
    let that = this;
    
    //将卡片姓名和卡片图像url添加到卡片表中
    api.postRequest({
      'url': '/topic/createtopic',
      'showLoading': false, 
      'data': {
        'topicname': value.input_topic_name,
        'topicurl': this.data.topic_url,
        'startdate': value.start_date,
        'enddate': value.end_date
      },
      'success': function(res){
        console.log('into success');
        console.log(res.error_code);
        if (res.error_code == 101) 
          that.showFailToast('这个卡片好像你以前添加过喔！换个卡片吧~');
        else if (res.error_code == 103){
          console.log('用户未登录，怎么会这样？');
          that.showFailToast('提交失败..大爷饶命，小的这就去查看原因..');
        }else if (res.error_code == 100)
          that.showFailToast('提交失败..大爷饶命，小的这就去查看原因..');
        else if (res.error_code == 200)
          that.showSucceedToast(); 
      },
      'fail': function(res){
        console.log('发送/topic/createtopic请求失败');
      }
    });

  },

  // 显示提示输入完整信息的toast
  showReminderAlert: function(alertMsg){
    wx.showModal({
      content: alertMsg,
      showCancel: false,
      success: function(res){
        if (res.confirm) console.log('用户在提示之后点击确定。');
      }
    });
  },

  // 显示提交成功的toast
  showSucceedToast: function(){
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
      success: function(){
        setTimeout(function(){
          wx.switchTab({
            url: '/pages/mytopic/mytopic',
          })
        }, 1000);
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
  }
});