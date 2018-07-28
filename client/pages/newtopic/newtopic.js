import {
  getFullDateSlash
} from '../../vendor/util'

var numEachRow = 5;

Page({
  data: {
    icon_data: [
      { "name": '/images/fuqi.png', "is_checked": false},
      { "name": '/images/cake.png', "is_checked": false },
      { "name": '/images/guozhi.png', "is_checked": false },
      { "name": '/images/saozhou.png', "is_checked": false },
      { "name": '/images/huatong.png', "is_checked": false },
      { "name": '/images/cat.png', "is_checked": false },
      { "name": '/images/dog.png', "is_checked": false },
      { "name": '/images/zixingche.png', "is_checked": false },
      { "name": '/images/camera.png', "is_checked": false },
      { "name": '/images/medicine.png', "is_checked": false },
      { "name": '/images/shufa.png', "is_checked": false },
      { "name": '/images/paobu.png', "is_checked": false },
      { "name": '/images/jianshen.png', "is_checked": false },
      { "name": '/images/jianfei.png', "is_checked": false },
      { "name": '/images/yuedu.png', "is_checked": false },
      { "name": '/images/chizaocan.png', "is_checked": false },
      { "name": '/images/qingchenyibeishui.png', "is_checked": false },
      { "name": '/images/zaoqi.png', "is_checked": false },
      { "name": '/images/zaoshui.png', "is_checked": false }],
    icon_name_num: [],
    selected_icon_num: -1,
    topic_name: '',
    name_given: false,
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
      topic_name: options.topic_name,
      name_given: options.topic_name != undefined
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

    // 设置is_checked为true
    var boolValue = "icon_data[" + id + "].is_checked";

    // 如果已经选择过图标，则要把之前选择过的替换，勾勾去除
    var selectedBoolValue = this.data.selected_icon_num != -1 ? 
        "icon_data[" + this.data.selected_icon_num + "].is_checked" : /* true */
        "icon_data[" + id + "].is_checked"; /* false */

    this.setData({
      selected_icon_num: id,
      [selectedBoolValue]: false,
      [boolValue]: true
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
        pre_end_date: this.data.end_date,
        end_date: '永不结束'
      });
    } else {
      this.setData({
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
    if (value.input_topic_name === '') {
      this.showReminderAlert('好像忘了填计划名称哟~');
      return;
    }

    //检查计划名称中是否包含特殊字符
    if (this.data.has_special_character == true) {
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
    if (this.data.selected_icon_num === -1) {
      this.showReminderAlert('随便选一个图标就好啦~');
      return;
    }

    console.log("topic name是：" + value.input_topic_name + 
      "\n selected id 是：" + this.data.selected_icon_num + 
      "\n所选择的图像url是：" + this.data.icon_data[this.data.selected_icon_num].name +
      "\n开始日期是：" + value.start_date + 
      "\n结束日期是：" + value.end_date);
    let that = this;
    //将卡片姓名和卡片图像url添加到卡片表中
    wx.request({
      url: getApp().config.request_head + '/db/createtopic',
      method: 'POST',
      data: {
        // 'userid': wx.getStorageSync('openidKey'),
        'userid': 'wgd2039dslkxEwsoiQW8023',
        'topicname': value.input_topic_name,
        'topicurl': this.data.icon_data[this.data.selected_icon_num].name,
        'startdate': value.start_date,
        'enddate': value.end_date
      },
      success: function (res) {
        if (res.data.status == 1)
          that.showFailToast('这个卡片好像你以前添加过喔！换个卡片吧~');
        else if (res.data.status == 2)
          that.showFailToast('提交失败..大爷饶命，小的这就去查看原因..');
        else
          // console.log('成功发送/db/createtopic请求，' + res.data);
          that.showSucceedToast(); 
      },
      fail: function(res){
        console.log('发送/db/createtopic请求失败');
        that.showFailToast('提交失败..大爷饶命，小的这就去查看原因..');
      } 
    })

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

  // 显示正在提交中的toast
  showLoadingToast: function(){
    wx.showToast({
      title: '正在提交中',
      icon: 'loading',
      duration: 2000
    })
  },

  // 显示提交失败的toast
  showFailToast: function(msg){
    wx.showToast({
        // title: '提交失败..大爷饶命，小的这就去查看原因..',
        title: msg,
        icon: 'none',
        duration: 2000
    })
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
  }
});