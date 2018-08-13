// var Charts = require('wxcharts.js');
const moment = require('../../vendor/moment.min.js');
const utils = require('../../vendor/utils.js');
const api = require('../../ajax/api.js');
const helper = require('helper.js');
const data = require('data.js');
const echarts = require('../../vendor/ec-canvas/echarts');
// import * as echarts from '../../vendor/ec-canvas/echarts';
let chart = null;
let colorList = ['#f8d3ad', '#f3c6ca'];


Page({
  data: {
    navbar: ['打卡日历', '每日完成度', '历史日志'],
    currentTab: 1,
    colorList: [ '#f3faf998', '#f6f3fa98', '#f6faf398', '#f9faf398',
               '#faf3f898', '#faf3f498', '#f3faf9a4', '#f3f7faa4'],


    /* --------------以下的data属于公共-------------- */
    check_time_per_topic: [], //每个topic的打卡天数：[{'跑步':['2018-06-13', '2018-06-24', '2018-06-21']}, {..}, {..}]
    check_info_per_topic: [], //每个topic的具体信息：{'跑步': [{check_time': '2018-06-13', 'log': '很好'}, {check_time': '2018-06-24', 'log': '还是很好'}], {'起床': [{}, {}, ..}], '':[], '': [],...}
    checked_data_list: [], // 用于展示每日具体打卡信息
    // topic_name_list: [], // 所有topic名字的集合：['减肥','跑步','早睡']
    topic_info: [], //该用户的打卡数据：[{'topic_name':'', 'topic_url':'', 'insist_day':''}, {}, ...] 用于【打卡日历】标题栏
    topic_info_map: {}, // {'name': {'topic_url':'', 'start_date':'',..}}
    start_date_list: [], //一个都是moment的list，所有topic的开始日期的集合
    end_date_list: [], //一个都是moment的list，所有topic的结束日期的集合


    /* --------------以下的data属于【打卡日历】-------------- */
    ec: {
      onInit: initChart,
    },
    date: '', // 用户选择的date，随时都会变化，初始化为当前时间
    current_date: '', // 当前的时间，用于打卡日历底部日期选择的enddate
    year_month_list: [], // 包含两个元素，初始化时，第一个是当前月的上个月，第二个是当前月
    selected_topic_idx: 0, //选中的topic
    topic_info_divided: {}, //每N个分为一组，方便显示
    topic_info_divided_size: 5, // N = 5
    topic_info_divided_idx: 0, //当前显示哪一组data（每一组有N个）
    check_first_date: '', //所有卡片中最早开始打卡的时间
    check_last_date: '', //所有卡片中最晚打卡的时间
    scroll_into_view_id: '',


    /* --------------以下的data属于【每日完成度】--------------*/
    //用于展示的图表对象
    average_completeness: 0,
    check_time_list: [], // 所有打卡的日期的集合['2018-07-04', '', ..]
    checked_topic_list_per_day: {}, // 每天打卡的卡片列表：{'2018-05-23': ['跑步'], ...}
    // total_topic_num_per_day: {}, // 每天需要打的卡的数量：{'2018-05-23': 3, ...}
    timelapses: data.timelapses,
    selected_timelapse: 0, //当前选中的时间区间的下标
    selected_canvas: 'week', //当前选择展示的图表，默认显示的是本周的
    completeness_week_subtitle: '', //每日完成度第一行要显示的标语
    completeness_current_date: moment().format('YYYY-MM-DD'), //每日完成度-1周-当前查看的周
    touch_move_x_start_pos: -1, //鼠标拖动图表的初始x值
    touch_move_y_start_pos: -1, //鼠标拖动图表的初始y值



    /* --------------以下的data属于【历史日志】--------------*/
    selected_topic_log: '', //被选中要查看日志的topic名字
    word_left_num: 140, //微信默认textarea最多输入140字
  },




  onLoad: function (options) {
    let that = this;
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.navbar').boundingClientRect((rects) => {
          that.setData({
            scrollHeight: res.windowHeight - rects[0].bottom - 30,
            scrollWidth: res.windowWidth
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
   * 初始化函数
   */
  init: function (tab) {
    if (tab == undefined) tab = this.data.currentTab;
    let that = this;

    /* 获取当前用户具体打卡信息 */
    data.getCheckDataList((error_code, msg, checked_data_list) => {
      if (error_code != 200 || !checked_data_list) return;
      getTopicInfoList(checked_data_list);
    });

    let getTopicInfoList = function (checked_data_list) {
      data.getTopicInfoList((error_code, msg, topic_info_list) => {
        if (error_code != 200) return;
        console.log('获取用户打卡信息成功');
        topic_info_list = utils.filterDatedData(topic_info_list);
        let topicInfoMap = getTopicInfoMap(topic_info_list);
        let [checkTimeListPerTopic, checkInfoListPerTopic] = data.getCheckedDataOfEveryTopic(checked_data_list, topicInfoMap); //按照每个topic分类的打卡时间集合
        let [startDateList, endDateList] = data.getStartEndDateList(topic_info_list);
        that.setData({
          date: moment(),
          topic_info: topic_info_list,
          check_time_per_topic: checkTimeListPerTopic,
          check_info_per_topic: checkInfoListPerTopic,
          checked_data_list: checked_data_list,
          topic_info_map: topicInfoMap,
          start_date_list: startDateList,  //一个都是moment的list
          end_date_list: endDateList,
        });

        if (tab == 0) {
          that.initCheckCalendar();
        } else if (tab == 1) {
          that.initCompleteness();
        } else if (tab == 2) {
          that.initCheckLog();
        }
      }
    )};

    /* 返回所有topic名字的list和topic对应的图片url的map */
    let getTopicInfoMap = function (list) {
      let topicInfoMap = {};
      for (let i in list) {
        topicInfoMap[[list[i].topic_name]] = {
          'topic_url': list[i].topic_url,
          'insist_day': list[i].insist_day,
          'total_day': list[i].total_day,
          'start_date': list[i].start_date,
          'end_date': list[i].end_date,
          'last_check_time': list[i].last_check_time
        };
      }
      return topicInfoMap;
    }
  },


  // 初始化每日打卡
  initCheckCalendar: function () {
    if (this.data.checked_data_list.length == 0 || 
        this.data.topic_info_list == 0) return;
    let checked_data_list = this.data.checked_data_list;

    if (this.data.checked_data_list.length != 0) {
      this.setData({
        check_first_date: moment(checked_data_list[checked_data_list.length - 1].check_time, 'YYYY-MM-DD'), //所有卡片最早开始打卡的时间
        check_last_date: moment(checked_data_list[0].check_time, 'YYYY-MM-DD'), //所有卡片中最晚打卡的时间
      });
    }

    this.setData({
      current_date: moment().format('YYYY-MM-DD'),
    });

    this.fillCalendar(moment().format('YYYY-MM'));
  },



  // 初始化每日完成度
  initCompleteness: function () {
    if (this.data.checked_data_list.length == 0) {
      this.setData({
        user_click_no_data: true
      });
      return;
    }

    let [checkTimeList, checkedTopicListPerDay] = data.getTopicListPerDay(this.data.checked_data_list);
    let that = this;
    this.setData({
      check_time_list: checkTimeList,
      checked_topic_list_per_day: checkedTopicListPerDay,
    });

    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().selectAll('.completeness-first-row').boundingClientRect((rects) => {
          let scrollHeight = that.data.scrollHeight;
          that.setData({
            canvasHeight: res.windowHeight - rects[0].top - 150,
          });
          data.option.grid.height = that.data.canvasHeight;
          data.option.grid.width = that.data.scrollWidth - 50;
          chart.setOption(data.option);
          // 生成当前周的数据
          that.newCanvas('1周', 0);
        }).exec();
      }
    });
  },


  // 初始化历史日志tab
  initCheckLog: function(){
    if (this.data.topic_info_list == 0) return;

    let completenessList = data.getCompletenessMap(this.data.topic_info_map, this.data.check_time_per_topic);
    this.setData({
      completeness_list: completenessList
    });
  },


  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.init();
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 800);
  },



  /* 具体实现往前端填充数据的方法 */
  fillCalendar: function (date) {
    date = moment(date, 'YYYY-MM');
    let allData = this.data.checked_data_list; //所有的data（按照topic分类的所有check信息
    // let allTopic = this.data.topic_name_list; //所有topic名字的集合
    let topic = this.data.topic_info[this.data.selected_topic_idx]['topic_name']; //当前选中的topic名
    let checkedTime = this.data.check_time_per_topic[topic]; //当前选中的topic的所有check信息
    var currentMoment = moment(date);
    var preMoment = moment(date).subtract(1, 'month');
    var prepreMoment = moment(date).subtract(2, 'month');


    this.setData({
      'year_month_list[2]': data.getCalendar(checkedTime, currentMoment, colorList[currentMoment.month() % 2]),
      'year_month_list[1]': data.getCalendar(checkedTime, preMoment, colorList[preMoment.month() % 2]),
      'year_month_list[0]': data.getCalendar(checkedTime, prepreMoment, colorList[prepreMoment.month() % 2]),
    });

    this.setData({
      selected_topic: this.data.topic_info[0]['topic_name'],
      scroll_into_view_id: 'id' + moment().format('YYYY-MM')
    });
  },




  /*--------------------------以下是打卡日历部分---------------------------*/

  // 切换tap时触发的函数
  navbarTap: function (e) {
    let tabidx = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: tabidx
    });
    if (tabidx == 0){
      this.initCheckCalendar();
    } else if (tabidx == 1){
      this.initCompleteness();
    } else if (tabidx == 2){
      this.initCheckLog();
    }
  },

  /**
   * 日历scroll-view滑动事件
   */
  calendarScroll: function (e) {
    // let deltaY = e.detail.deltaY; //大于0上滑小于0下滑
    // console.log('scrollTop:' + e.detail.scrollTop)


    if (e.detail.scrollTop == 0 ) {//上滑到顶了
      // let idx = this.data.year_month_list_max_idx;
      let currentSelectedDate = moment(this.data.date);
      // let allTopic = this.data.topic_name_list; //所有topic名字的集合
      let topic = this.data.topic_info[this.data.selected_topic_idx]['topic_name']; //当前选中的topic名
      let checkedTime = this.data.check_time_per_topic[topic]; //当前选中的topic的所有check信息

      let newDate = moment(currentSelectedDate).subtract(3, 'month');
      if (newDate < this.data.check_last_date) {
        wx.showToast({
          title: '没有更多打卡数据惹~',
          icon: 'none'
        })
        return;
      }


      wx.showLoading({
        title: '正在加载数据',
      })

      let new_year_month_list = this.data.year_month_list;
      new_year_month_list.unshift(data.getCalendar(checkedTime, newDate, colorList[newDate.month() % 2]));


      this.setData({
        year_month_list: new_year_month_list,
        date: moment(currentSelectedDate).subtract(1, 'month'),
      });
      wx.hideLoading();
    }
  },

  // 日期选择框改变时触发的事件
  bindPickerChange: function (e) {
    this.fillCalendar(e.detail.value);
  },

  // 文字卡片选择框改变时触发的事件
  bindTopicChange: function (e) {
    let topicIndx = e.detail.value;
    this.setData({
      selected_topic_idx: topicIndx,
      topic_info_divided_idx: parseInt(topicIndx / this.data.topic_info_divided_size),
    });
    this.fillCalendar(this.data.date.format('YYYY-MM'));
  },

  // 单击左侧topic触发的事件
  tapTopic: function (e) {
    this.setData({
      selected_topic_idx: e.currentTarget.dataset.topicIdx,
    });
    this.fillCalendar(this.data.date.format('YYYY-MM'));
  },

  // 单击获取下一组的topic
  getNextTopicGroup: function (e) {
    let originTopicGroupIdx = this.data.topic_info_divided_idx;
    this.setData({
      topic_info_divided_idx: originTopicGroupIdx + 1
    });
  },

  // 单击获取上一组的topic
  getPreTopicGroup: function (e) {
    let originTopicGroupIdx = this.data.topic_info_divided_idx;
    this.setData({
      topic_info_divided_idx: originTopicGroupIdx - 1
    });
  },

  // 单击日历上的某一天，跳转显示当前具体打的卡片
  bindTapOnDate: function (e) {
    let chosenDate = e.currentTarget.dataset.currentDate;
    if (moment(chosenDate, 'YYYY-MM-DD') > moment()){
      content = '未来的事情宝宝无法预测嗷~';
    }else{
      let checkedDetail = data.getCheckDetailOnGivenDay(
                  this.data.checked_data_list, chosenDate);

      let completeness = data.getCompletePercentageOfDay(chosenDate, checkedDetail.length, this.data.topic_info.length, this.data.start_date_list, this.data.end_date_list);
      var content = '您在' + chosenDate;
      checkedDetail.length == 0 ? content += '没打卡,继续努力哟~'
        : content += '打了' + checkedDetail.length + "张卡：[" + checkedDetail.toString() +
        ']，当日打卡完成度为' + completeness + '%';

    }
    wx.showModal({
      content: content,
      showCancel: false,
      success: function (res) { }
    });
  },





  /*----------------------以下是每日完成度部分-----------------------*/
  
  /**
   *  单击时间区间触发的方法
   */
  selectTimeLapse: function (e) {
    let time = e.currentTarget.dataset.time;
    let index = e.currentTarget.dataset.index;

    let preCheckedStr = 'timelapses[' + this.data.selected_timelapse + '].checked';
    let newCheckedStr = 'timelapses[' + index + '].checked';

    this.setData({
      'selected_timelapse': index,
      [preCheckedStr]: false,
      [newCheckedStr]: true
    });

    this.newCanvas(time, 0);
  },

  /**
   * 处理用户在canvas上的拖拽开始事件
   */
  canvasTouchStart: function(e){
    this.setData({
      touch_move_x_start_pos: e.changedTouches[0].pageX,
      touch_move_y_start_pos: e.changedTouches[0].pageY
    });
  },


  /**
   * 处理用户在canvas上拖拽的事件
   */
  canvasTouchMove: function(e){
    if (this.data.touch_move_x_start_pos == -1) return;
    let x = e.changedTouches[0].pageX;
    let y = e.changedTouches[0].pageY;
    if (Math.abs(this.data.touch_move_x_start_pos - x) <= 200) return;
    if (Math.abs(this.data.touch_move_y_start_pos - y) >= 30) return;
    // 向右划，时间往回
    if (x - this.data.touch_move_x_start_pos > 200) {
      this.completenessPreTimelapse();
    } else if (this.data.touch_move_x_start_pos - x > 200) {
      //向左滑，时间往前
      this.completenessNextTimelapse();
    }


    this.setData({
      touch_move_x_start_pos: -1
    });
  },



  /**
   * 新建canvas并往里填充数据
   */
  newCanvas: function (timelapse, n) {
    let ans = data.getCanvasData(
                this.data.check_time_list,
                this.data.checked_topic_list_per_day,
                this.data.completeness_current_date,
                this.data.start_date_list, 
                this.data.end_date_list, 
                this.data.topic_info.length,
                timelapse, n); //生成新的每周数据
    
    let canvasXText = ans['xtext'];
    let canvasYData = ans['ydata'];
    let avg = 0;

    console.log(canvasYData)

    if (ans['startdate'] > moment()){
      this.setData({
        user_click_on_future: true,
        user_click_no_data: false
      });
    } else if (!canvasYData || (canvasYData && helper.checkIfAllZero(canvasYData))){
      this.setData({
        user_click_no_data: true,
        user_click_on_future: false
      });
    }else{
      let sum = 0;
      let validNum = 0;
      for (let i in canvasYData){
        sum += canvasYData[i];
        validNum += canvasYData[i] ? 1 : 0;
      }

      avg = (sum/validNum).toFixed(2);
      

      this.setData({
        user_click_on_future: false,
        user_click_no_data: false,
      });
    }

    this.setData({
      average_completeness: avg,
      completeness_current_date: ans['enddate'].format('YYYY-MM-DD'),
      completeness_week_subtitle: ans['subtitle'],
    });

    if (this.data.user_click_no_data || this.data.user_click_on_future)
      canvasXText = [];

    setChart(canvasXText, canvasYData);
  },


  completenessChangeTimelapse: function (n) {
    // if (this.data.selected_timelapse == 3) return;
    let selectedTimelapseName = this.data.timelapses[this.data.selected_timelapse].name;
    this.newCanvas(selectedTimelapseName, n);
  },


  /**
   * “每日完成度”单击向左图片所触发的函数
   */
  completenessPreTimelapse: function () {
    this.completenessChangeTimelapse(-1);
  },


  /**
   * “每日完成度”单击向右图片所触发的函数
   */
  completenessNextTimelapse: function () {
    this.completenessChangeTimelapse(1);
  },
  



  /*---------------------以下是打卡日志部分---------------------------*/
  selectTopicLog: function(e){
    let indexKey = e.currentTarget.dataset.idx;
    // console.log(indexKey)
    if (indexKey == this.data.selected_topic_log)
      indexKey = '';
    this.setData({
      selected_topic_log: indexKey,
    });
  },



  /**
   * 单击日志
   */
  tapOnLog: function (e) {
    let topic_name = e.currentTarget.dataset.topicName;
    //当前topic的第idx个日志
    let topic_log_idx = e.currentTarget.dataset.idx; 
    let check_time = e.currentTarget.dataset.date;
    let check_timestamp = e.currentTarget.dataset.time;
    let log = e.currentTarget.dataset.log;
    let cur_word_left = this.data.word_left_num;

    this.setData({
      topic_name: topic_name,
      topic_log_idx: topic_log_idx,
      check_time: check_time, 
      check_timestamp: check_timestamp,
      log: log,
      show_modal: true,
      word_left_num: cur_word_left - log.length,
    });
  },


  /**
   * 长按日志，弹出删除窗口
   */
  // longTapLog: function(e){
  //   let that = this;
  //   wx.showModal({
  //     title: '删除',
  //     content: '确定要删除这次打卡吗？',
  //     showCancel: true,
  //     success: (res)=>{
  //       if (!res.confirm) return;
  //       let topic_name = e.currentTarget.dataset.topicName,
  //         check_time = e.currentTarget.dataset.date,
  //         check_timestamp = e.currentTarget.dataset.time,
  //         idx = e.currentTarget.dataset.idx;
  //       api.postRequest({
  //         'url': '/topicCheck/deleteCheck',
  //         'data':{
  //           topic_name: topic_name, 
  //           check_time: check_time,
  //           check_timestamp: check_timestamp
  //         },
  //         'success': (res) => {
  //           if (res.error_code != 200){
  //             console.log('删除打卡失败');
  //             return;
  //           }
  //           console.log('删除打卡成功');
  //           let new_check_info_per_topic = that.data.check_info_per_topic;
  //           let new_check_info = new_check_info_per_topic[topic_name];
  //           delete new_check_info[idx];
  //           console.log(new_check_info)
  //           new_check_info_per_topic[topic_name] = new_check_info
  //           that.setData({
  //             check_info_per_topic: new_check_info_per_topic
  //           });
  //         },
  //         'fail': (res) => { console.log('删除打卡失败');},
  //       });
  //     }
  //   })
  // },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { },


  /**
   * 弹出框获取焦点时的事件
   */
  focusTextarea: function(){
    this.setData({
      textarea_focus: true
    });
  },

  /**
   * 弹出框失去焦点时的事件
   */
  blurTextarea: function(){
    this.setData({
      textarea_focus: false
    });
  },


  /**
   * 不再显示，隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      show_modal: false,
      topic_name: '',
      check_time: '',
      check_timestamp: '',
      log: ''
    });
  },


  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    api.postRequest({
      'url': '/topicCheck/updateLog',
      'data': {
        topic_name: this.data.topic_name,
        check_time: this.data.check_time,
        check_timestamp: this.data.check_timestamp,
        log: this.data.new_log,
      },
      'success': (res) => {
        if (res.error_code == 200)
          console.log('更新日志成功');
        else
          console.log('更新日志失败');
      },
      'fail': (res) => {
        console.log('更新日志失败');
      }
    });

    let check_info_per_topic = this.data.check_info_per_topic;
    check_info_per_topic[this.data.topic_name][this.data.topic_log_idx]['log'] = this.data.new_log;

    this.setData({
      check_info_per_topic: check_info_per_topic
    });
    this.hideModal();
  },



  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },

  /**
   * 输入框字数变化时触发的函数
   */
  inputChange: function (e) {
    this.setData({
      word_left_num: 140 - e.detail.value.length, //默认最多输入140
      new_log: e.detail.value
    });
  },



})





/**
 * 图表配置部分
 */
function setChart(xdata, ydata){
  data.option.xAxis[0].data = xdata;
  data.option.series[0].data = ydata;
  // option.series[1].data = ydata;
  chart.setOption(data.option);
};

function initChart(canvas, width, height) { //初始化图表
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  return chart;
}
