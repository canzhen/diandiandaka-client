// var Charts = require('wxcharts.js');
const moment = require('../../vendor/moment.min.js');
const utils = require('../../vendor/utils.js');
const api = require('../../ajax/api.js');
const helper = require('helper.js');
const data = require('data.js');
// const echarts = require('../../vendor/ec-canvas/echarts');
import * as echarts from '../../vendor/ec-canvas/echarts';
let chart = null;


Page({
  data: {
    navbar: ['打卡日历', '每日完成度', '历史日志'],
    currentTab: 2,

    /* --------------以下的data属于【打卡日历】-------------- */
    date: '', // 用户选择的date，随时都会变化
    current_date: '', // 当前的时间，用于打卡日历底部日期选择的enddate
    year_month_list: [], // 包含两个元素，初始化时，第一个是当前月的上个月，第二个是当前月
    selected_topic_idx: 0, //选中的topic
    topic_info: [], //该用户的打卡数据：[{'topic_name':'', 'topic_url':'', 'insist_day':''}, {}, ...] 用于【打卡日历】标题栏
    topic_info_divided: {}, //每N个分为一组，方便显示
    topic_info_divided_size: 5, // N = 5
    topic_info_divided_idx: 0, //当前显示哪一组data（每一组有N个）
    checked_data_list: [], // 用于展示每日具体打卡信息


    /* --------------以下的data属于【每日完成度】--------------*/
    //用于展示的图表对象
    ec:{
      onInit: initChart
    },
    average_completeness: 0,
    check_time_per_topic: [], //每个topic的打卡天数：[{'跑步':['2018-06-13', '2018-06-24', '2018-06-21']}, {..}, {..}]
    check_info_per_topic: [], //每个topic的具体信息：[{'跑步': {check_time': '2018-06-13', 'log': '很好'}, {check_time': '2018-06-24', 'log': '还是很好'}}, {'起床': {{}, {}, ..}}, {},...]
    check_time_list: [], // 所有打卡的日期的集合['2018-07-04', '', ..]
    topic_name_list: [], // 所有topic名字的集合：['减肥','跑步','早睡']
    topic_list_per_day: {}, // 每天打卡的卡片列表：{'2018-05-23': ['跑步'], ...}
    timelapses: [ //所有的时间区间的选项
                  { 'name': '1周', 'checked': true },
                  { 'name': '1个月', 'checked': false },
                  { 'name': '1年', 'checked': false },
                  { 'name': '全部', 'checked': false }], 
    selected_timelapse: 0, //当前选中的时间区间的下标
    selected_canvas: 'week', //当前选择展示的图表，默认显示的是本周的
    completeness_week_subtitle: '', //每日完成度第一行要显示的标语
    completeness_current_date: moment().format('YYYY-MM-DD'), //每日完成度-1周-当前查看的周
    touch_move_x_start_pos: -1, //鼠标拖动图表的距离



    /* --------------以下的data属于【历史日志】--------------*/
    topic_url_map:[], //用于存每个topic对应的图标url
    selected_topic_log: '', //被选中要查看日志的topic名字
  },


  /**
   * 初始化函数
   */
  init: function (tab) {
    if (tab == undefined) tab = this.data.currentTab;
    if (tab == 0){
      this.initCheckCalendar();
    } else if (tab == 1) {
      this.initCheckCalendar();
      this.initCompleteness();
    } else if (tab == 2) {
      this.initCheckCalendar();
      this.initCheckLog();
    }
  },

  // 初始化每日打卡
  initCheckCalendar: function () {
    let that = this;
    /* 返回所有topic名字的list和topic对应的图片url的map */
    let getTopicNameAndUrlList = function (list) {
      var nameList = [];
      var topicUrlMap = {};
      for (let i in list) {
        nameList.push(list[i].topic_name);
        topicUrlMap[[list[i].topic_name]] = list[i].topic_url;
      }
      return [nameList, topicUrlMap];
    }

    /* 获取用户卡片信息 */
    let getTopicInfoList = function (checked_data_list){
      data.getTopicInfoList((error_code, msg, topic_info_list) => {
        if (error_code != 200) return;
        console.log('获取用户打卡信息成功');
        topic_info_list = utils.filterDatedData(topic_info_list);
        let [allTopic, topicUrlMap] = getTopicNameAndUrlList(topic_info_list);
        let [checkTimeListPerTopic, checkInfoListPerTopic] = data.getCheckedDataOfEveryTopic(checked_data_list, allTopic); //按照每个topic分类的打卡时间集合
        let allTopicInfoDivided = data.divideTopicInfoIntoGroups(
          checkInfoListPerTopic,
          topic_info_list,
          that.data.topic_info_divided_size);
        that.setData({
          checked_data_list: checked_data_list, //用于展示每日具体打卡信息
          current_date: moment().format('YYYY-MM-DD'),
          topic_info: topic_info_list,
          topic_name_list: allTopic,
          topic_url_map: topicUrlMap,
          //被N个N个分成一组的topics
          topic_info_divided: allTopicInfoDivided,
          //根据topic分类的check信息
          check_time_per_topic: checkTimeListPerTopic,
          check_info_per_topic: checkInfoListPerTopic,
        });
        that.fillCalendar(moment().format('YYYY-MM'));
      });
    }

    /* 获取当前用户具体打卡信息 */
    data.getCheckDataList((error_code, msg, checked_data_list) => {
      if (error_code != 200 || !checked_data_list) return;
      getTopicInfoList(checked_data_list); /* 获取用户卡片信息 */
    });
  },



  // 初始化每日完成度
  initCompleteness: function () {
    let [checkTimeList, topicListPerDay] = data.getTopicListPerDay(this.data.checked_data_list);
    this.setData({
      check_time_list: checkTimeList,
      topic_list_per_day: topicListPerDay,
    });

    // 生成当前周的数据
    this.newCanvas('1周', 0);
  },


  // 初始化历史日志tab
  initCheckLog: function(){

  },


  onShow: function () {
    if (!utils.getStorageSync('sessionId')){ 
      utils.login((res) => {
        if (res) {
          console.log('login success');
          this.init(); 
        } else
          console.log('login fail');
      });
    }else{
      this.init();
    }
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
    let allTopic = this.data.topic_name_list; //所有topic名字的集合
    let topic = allTopic[this.data.selected_topic_idx]; //当前选中的topic名
    let checkedTime = this.data.check_time_per_topic[topic]; //当前选中的topic的所有check信息
    var currentMoment = moment(date);
    var preMonthMoment = moment(date).subtract(1, 'month');

    this.setData({
      // 获取当前月份的天数组，以及相应的每天的是否打卡的数据
      'year_month_list[1]': data.getCalendar(checkedTime, currentMoment,'#f8d3ad'),
      'year_month_list[0]': data.getCalendar(checkedTime, preMonthMoment,'#f3c6ca'),
      date: moment(date).format('YYYY-MM'),
      dateCN: moment(date).format('YYYY年MM月'),
      selected_topic: allTopic[0]
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

  // 日期选择框改变时触发的事件
  bindPickerChange: function (e) {
    this.fillCalendar(e.detail.value);
  },

  // 获取上个月的数据
  getLastMonth: function (e) {
    this.fillCalendar(moment(this.data.date, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  },

  // 获取下个月的数据
  getNextMonth: function (e) {
    this.fillCalendar(moment(this.data.date, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
  },

  // 文字卡片选择框改变时触发的事件
  bindTopicChange: function (e) {
    let topicIndx = e.detail.value;
    this.setData({
      selected_topic_idx: topicIndx,
      topic_info_divided_idx: parseInt(topicIndx / this.data.topic_info_divided_size),
    });
    this.fillCalendar(this.data.date);
  },

  // 单击左侧topic触发的事件
  topicTap: function (e) {
    var topicIdx = e.currentTarget.dataset.topicIdx;
    this.setData({
      selected_topic_idx: topicIdx,
    });
    this.fillCalendar(this.data.date);
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
      let completeness = (checkedDetail.length / this.data.topic_info.length).toFixed(1);
      var content = '您在' + chosenDate;
      checkedDetail.length == 0 ? content += '没打卡,继续努力哟~'
        : content += '打了' + checkedDetail.length + "张卡：[" + checkedDetail.toString() +
        ']，当日打卡完成度为' + parseInt(completeness * 100) + '%';

    }
    wx.showModal({
      content: content,
      showCancel: false,
      success: function (res) { }
    });
  },





  /*------------------------以下是每日完成度部分-------------------------*/
  
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

    let selectedCanvasName = this.data.timelapses[this.data.selected_timelapse].name;

    this.newCanvas(time, 0);
  },



  /**
   * 处理用户在canvas上的拖拽开始事件
   */
  canvasTouchStart: function(e){
    console.log('start')
    this.setData({
      touch_move_x_start_pos: e.changedTouches[0].pageX
    });
  },


  /**
   * 处理用户在canvas上拖拽的事件
   */
  canvasTouchMove: function(e){
    if (this.data.touch_move_x_start_pos == -1) return;
    // console.log(e)
    let x = e.changedTouches[0].pageX;
    if (Math.abs(this.data.touch_move_x_start_pos - x) <= 200) return;
    // console.log(e.touches.pageX)
    // 向右划，时间往回
    if (x - this.data.touch_move_x_start_pos > 200) {
      console.log('move' + parseInt(x - this.data.touch_move_x_start_pos))
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
                this.data.topic_list_per_day,
                this.data.completeness_current_date,
                this.data.topic_name_list.length,
                timelapse, n); //生成新的每周数据
    
    let canvasXText = ans['xtext'];
    let canvasYData = ans['ydata'];
    let avg = 0;


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
      // canvasXText = helper.getCanvasXText(
      //   timelapse, this.data.completeness_current_date);
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
  



  /*--------------------------以下是打卡日志部分---------------------------*/
  selectTopicLog: function(e){
    let indexKey = e.currentTarget.dataset.idx;
    // console.log(indexKey)
    if (indexKey == this.data.selected_topic_log)
      indexKey = '';
    this.setData({
      selected_topic_log: indexKey,
    });
  }

})





/**
 * 图表配置部分
 */

var option = {
  color: ['#37a2da', '#32c5e9', '#67e0e3'],
  grid: {
    left: 10,
    top: 0,
    right: 10,
    bottom: 10,
    width: 340,
    height: 370,
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      silent: true,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        margin: 10,
        textStyle: {
          color: '#888888'
        }
      },
    }
  ],
  yAxis: {
    show: false,
    min: 0,
    max: 100
  },
  series: [{
      type: 'bar',
      data: [],
      markLine:{
        data: [{ type: 'average' }],
        label:{
          show: true,
          position: 'middle',
          formatter:  '平均{c}%',
        },
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10,
          opacity: 1
        },
      },
      silent: true,
      clickable: false,
      barCategoryGap: '25%',
      label: {
        show: true,
        // position: 'top',
        color: 'rgba(136, 136, 136, 1)',
        rotate: 90,
        fontSize: 10,
        formatter: '{c}%'
      },
      itemStyle: {
        normal: {
          barBorderRadius: 5,
          color: '#feddbb',
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 5,
        }
      }
    },{ // 连接柱状图的曲线
      type: 'line',
      data: [],
      silent: true,
      smooth: true,
      clickable: false,
      itemStyle: {
        normal: {
          color: 'rgba(136, 136, 136, 0.5)'
        }
      }
    }]
};

function setChart(xdata, ydata){
  option.xAxis[0].data = xdata;
  option.series[0].data = ydata;
  // option.series[1].data = ydata;
  chart.setOption(option);
};

function initChart(canvas, width = 375, height = 400) { //初始化图表
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  // chart.setOption(data.option);
  return chart;
}
