
import {
  getCheckedDataList,
  getTopicInfo,
} from './data'

var Charts = require('wxcharts.js');
var utils = require('../../vendor/utils.js');

Page({
  data: {
    navbar: ['所有历史', '每日完成度'],
    currentTab: 1,

    /* --------------以下的data属于【所有历史】-------------- */
    date: '', // 用户选择的date，随时都会变化
    current_date: '', // 当前的时间，一旦设置则不会改变
    year_month_list: [], // 包含两个元素，初始化时，第一个是当前月的上个月，第二个是当前月
    checked_data_list: getCheckedDataList(), // checked_data_list包含打卡数据
    selected_topic_idx: 0,
    checked_time_per_topic: [], //每个topic的打卡天数：[{'跑步':['2018-06-13', '2018-06-24', '2018-06-21']}, {..}, {..}]
    all_topic: [], //所有topic名字的集合：['减肥','跑步','早睡']
    successive_day_per_topic: [], //每个topic的【连续】打卡天数：[{'跑步':{'num':3,'image_url': 'xxxx'}},{...},..]
    topic_info: getTopicInfo(), //存该用户所有topic的info，包括image_url（直接数据库调取）和连续打卡天数（经过计算的来）
    topic_info_divided: {}, //每N个分为一组，方便显示
    topic_info_divided_size: 5, // N = 5
    topic_info_divided_idx: 0, //当前显示哪一组data（每一组有N个）


    /* --------------以下的data属于【每日完成度】--------------*/
    timelapses: [ //所有的时间区间的选项
                  { 'name': '1周', 'checked': true },
                  { 'name': '1个月', 'checked': false },
                  { 'name': '3个月', 'checked': false },
                  { 'name': '1年', 'checked': false },
                  { 'name': '全部', 'checked': false }], 
    selected_timelapse: 0, //当前选中的时间区间的下标
    selected_canvas: 'week', //当前选择展示的图表，默认显示的是本周的
    completeness_week_subtitle: '', //每日完成度第一行要显示的标语
    completeness_week_current_date: null, //每日完成度-1周-当前查看的周
    touchMoveXPos: -1, //鼠标拖动图表的距离
  },




  init: function(){
    /* 获取当前年、月 */
    let today = new Date();
    let allTopic = utils.getAllTopicList(this.data.checked_data_list); //所有topic名字的集合
    let checkedTimeList = utils.getCheckedDataOfEveryTopic(this.data.checked_data_list, allTopic);
    let fullTopicInfo = utils.getAndCalculateTopicInfo(checkedTimeList, this.data.topic_info);
    let allTopicInfoDivided = utils.divideTopicInfoIntoGroups(
      checkedTimeList,
      this.data.topic_info,
      this.data.topic_info_divided_size);
    this.setData({ //初始化当前日期，且不再改变
      current_date: today.getFullYear() + '-' + parseInt(today.getMonth() + 1),
      all_topic: allTopic, //所有topic名字的集合
      topic_info: fullTopicInfo, //所有topic info
      topic_info_divided: allTopicInfoDivided, //被N个N个分成一组的topics
      checked_time_per_topic: checkedTimeList, //根据topic分类的check信息
    });
    this.fillData(this.data.current_date);
    this.setCompletenessSubtitle('1周', 0), //一周的历史记录上的文字
      this.newCanvas(['一', '二', '三', '四', '五', '六', '七'],
        [15, 20, 45, 37, 4, 80, 19]); //生成新的每周数据
  },



  onLoad: function () {
    this.init();
  },


  /* 具体实现往前端填充数据的方法 */
  fillData: function (date) {
    let allData = this.data.checked_data_list; //所有的data（按照topic分类的所有check信息
    let allTopic = this.data.all_topic; //所有topic名字的集合
    let topic = allTopic[this.data.selected_topic_idx]; //当前选中的topic名
    let checkedTime = this.data.checked_time_per_topic[topic]; //当前选中的topic的所有check信息

    var year = date.split('-')[0];
    var month = date.split('-')[1];
    var preYear = month == 1 ? year - 1 : year;
    var preMonth = month == 1 ? 12 : month - 1;

    this.setData({
      // 获取当前月份的天数组，以及相应的每天的是否打卡的数据
      'year_month_list[1]': utils.generateCalendar(checkedTime, year, month, '#f8d3ad'),
      'year_month_list[0]': utils.generateCalendar(checkedTime, preYear, preMonth, '#f3c6ca'),
      date: year + '-' + utils.addZero(month),
      dateCN: utils.translateFormateDate(year + '-' + utils.addZero(month)),
      selected_topic: allTopic[0]
    });
  },



  /**
   * 所有历史部分
   */
  // 单击tap时触发的函数
  navbarTap: function (e) {
    let tabidx = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: tabidx
    });
  },

  // 日期选择框改变时触发的事件
  bindPickerChange: function (e) {
    this.fillData(e.detail.value);
  },

  // 获取上个月的数据
  getLastMonth: function (e) {
    this.fillData(lastMonth(this.data.date));
  },

  // 获取下个月的数据
  getNextMonth: function (e) {
    this.fillData(nextMonth(this.data.date));
  },

  // 文字卡片选择框改变时触发的事件
  bindTopicChange: function (e) {
    let topicIndx = e.detail.value;
    this.setData({
      selected_topic_idx: topicIndx,
      topic_info_divided_idx: parseInt(topicIndx / this.data.topic_info_divided_size),
    });
    this.fillData(this.data.date);
  },

  // 单击左侧topic触发的事件
  topicTap: function (e) {
    var topicIdx = e.currentTarget.dataset.topicIdx;
    this.setData({
      selected_topic_idx: topicIdx,
    });
    this.fillData(this.data.date);
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
    let checkedDetail = utils.getCheckDetailOnGivenDay(
      this.data.checked_data_list,
      e.currentTarget.dataset.currentDate);
    let completeness = (checkedDetail.length / this.data.topic_info.length).toFixed(2);
    var content = '您在' + e.currentTarget.dataset.currentDate;
    checkedDetail.length == 0 ? content += '没打卡,继续努力哟~'
      : content += '打了' + checkedDetail.length + "张卡：" + checkedDetail.toString() +
      '，当日打卡完成度为' + parseInt(completeness * 100) + '%';

    wx.showModal({
      content: content,
      showCancel: false,
      success: function (res) { }
    });
  },





  /*--------------------------以下是每日完成度部分---------------------------*/
  
  /*
  单击时间区间触发的方法
  */
  selectTimeLapse: function (e) {
    let time = e.currentTarget.dataset.time;
    let index = e.currentTarget.dataset.index;
    console.log('选中了' + time);

    let preCheckedStr = 'timelapses[' + this.data.selected_timelapse + '].checked';
    let newCheckedStr = 'timelapses[' + index + '].checked';
    
    this.setCompletenessSubtitle(time, 0);

    this.setData({
      'selected_timelapse': index,
      [preCheckedStr]: false,
      [newCheckedStr]: true 
    });
  },

  /**
   * 新建canvas并往里填充数据
   */
  newCanvas: function (categories, data) {
    /* 新建图表 */
    new Charts({
      canvasId: 'myCanvas',
      type: 'column',
      categories: categories,
      series: [{
        name: '完成度',
        data: data
      }],
      yAxis: {
        format: function (val) {
          return val + '%';
        }
      },
      width: 350,
      height: 380
    });
  },

  
  
  /**
   * 获取每日完成度-1周-的子标题："2018.08.14到2018.08.21"
   * @param n int: 上周还是下周，还是当前，如果是上周则为-1，如果是下周则为1，如果是当前则为0
   */
  setCompletenessSubtitle: function (timelapse, n) {
    let ans = utils.getCompletenessSubtitle(this.data.completeness_week_current_date, timelapse, n);
    // console.log('n=' + n);
    // console.log('timelapse=' + timelapse);
    // console.log('before, current_date:' + this.data.completeness_week_current_date);


    if (ans == false) return false;
    this.setData({
      completeness_week_subtitle: ans['subtitle'],
      completeness_week_current_date: ans['enddate']
    });
    
    return true;

    // console.log('after, current_date:' + this.data.completeness_week_current_date);

  },


  /*
  canvas被单击并拖拽时开始触发的函数
  */
  bindCanvasTouchStart: function (e) {
    this.setData({
      touchMoveXPos: -1
    });
  },

  /*
  canvas被单击并拖拽时触发的函数
  */
  bindCanvasTouchMove: function (e) {
    if (e.touches.length == 0) return;
    let currentXPos = e.touches[0].x;
    if (this.data.touchMoveXPos == -1) {
      this.setData({ touchMoveXPos: currentXPos });
      return;
    }
    if (Math.abs(this.data.touchMoveXPos - currentXPos) <= 200) return;

    if (currentXPos - this.data.touchMoveXPos >= 200) { //右滑，显示上一周
      if (this.setCompletenessSubtitle(this.data.timelapses[this.data.selected_timelapse].name, -1))
        this.newCanvas(['一', '二', '三', '四', '五', '六', '七'], 
                      [0, 0, 0, 41, 52, 23, 48]);
    } else if (this.data.touchMoveXPos - currentXPos >= 200) { //左滑，显示下周
      if (this.setCompletenessSubtitle(this.data.timelapses[this.data.selected_timelapse].name, 1))
      this.newCanvas(['一', '二', '三', '四', '五', '六', '七'],
                      [41, 52, 23, 48, 0, 0, 0]);
    }

    this.setData({
      touchMoveXPos: -1
    });
  },

  /*
  canvas被单击并拖拽结束时触发的函数
  */
  bindCanvasTouchEnd: function (e) {
    // this.setData({
    //   touchMoveXPos: -1
    // });
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

})