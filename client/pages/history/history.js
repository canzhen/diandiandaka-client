const moment = require('../../vendor/moment.js');
const utils = require('../../vendor/utils.js');
const api = require('../../ajax/api.js');
const helper = require('helper.js');
const data = require('data.js');
const echarts = require('../../vendor/ec-canvas/echarts');
// import * as echarts from '../../vendor/ec-canvas/echarts';
let barChart = null;
let lineChart = null;
let colorList = ['#f8d3ad', '#f3c6ca'];

Page({
  data: {
    navbar: ['打卡日历', '卡片数据', '历史日志'],
    currentTab: 0,
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
    ec_bar: {
      onInit: initBarChart,
    },
    ec_line: {
      onInit: initLineChart,
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
    checked_topic_list_per_day: {}, // 每天打卡的卡片列表：{'2018-05-23': ['跑步'], ...}

    /* --------------以下的data属于【历史日志】--------------*/
    selected_topic_log: '', //被选中要查看日志的topic名字
    word_left_num: 140, //微信默认textarea最多输入140字
  },


  /**
   * 分享转发给朋友
   */
  onShareAppMessage: (res) => {
    if (res.from === 'button') {
      console.log("来自页面内转发按钮");
      console.log(res.target);
    } else {
      console.log("来自右上角转发菜单")
    }

    return {
      title: '打卡历史',
      path: '/pages/history/history',
      imageUrl: "/images/3selected.jpg",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
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
    // 返回时初始化数据
    this.setData({
      currentTab: 0,
    })
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
    wx.showLoading({
      title: '正在加载中',
    })
      /* 获取当前用户的所有卡片 */
    data.getTopicInfoList((error_code, msg, topic_info_list) => {
      if(error_code == 102 || error_code == 103) {
        utils.login((res) => { });
        wx.showToast({
          title: '好像出了点问题，可以刷新一下咩~',
          icon: 'none'
        })
        return;
      }
      topic_info_list = utils.filterDataFromDB(topic_info_list);
      let topicInfoMap = getTopicInfoMap(topic_info_list);
      let [startDateList, endDateList] = data.getStartEndDateList(topic_info_list);
      /* 获取当前用户具体打卡信息 */
      data.getCheckDataList((error_code, msg, checked_data_list) => {
        if (error_code != 200 || !checked_data_list) return;
        let [checkTimeListPerTopic, checkInfoListPerTopic] = data.getCheckedDataOfEveryTopic(checked_data_list, topicInfoMap); //按照每个topic分类的打卡时间集合
        let [_, checkedTopicListPerDay] = data.getTopicListPerDay(checked_data_list);

        that.setData({
          date: moment(),
          topic_info: topic_info_list,
          checked_data_list: checked_data_list,
          check_time_per_topic: checkTimeListPerTopic,
          check_info_per_topic: checkInfoListPerTopic,
          topic_info_map: topicInfoMap,
          start_date_list: startDateList,  //一个都是moment的list
          end_date_list: endDateList,
          checked_topic_list_per_day: checkedTopicListPerDay,
        });

        wx.hideLoading();

        if (tab == 0) {
          that.initCheckCalendar();
        } else if (tab == 1){
          this.initTopicCheckData();
        }else if (tab == 2) {
          that.initCompleteness();
        } else if (tab == 3) {
          that.initCheckLog();
        }
      }, function (res) {
      });
    });

    /* 返回所有topic名字的list和topic对应的图片url的map */
    let getTopicInfoMap = function (list) {
      let topicInfoMap = {};
      for (let i in list) {
        topicInfoMap[[list[i].topic_name]] = {
          'dated': list[i].dated,
          'topic_url': list[i].topic_url,
          'insist_day': list[i].insist_day,
          'total_day': list[i].total_day,
          'start_date': list[i].start_date,
          'end_date': list[i].end_date,
          'last_check_time': list[i].last_check_time,
          'topic_count_phase': list[i].topic_count_phase,
          'topic_count_unit': list[i].topic_count_unit
        };
      }
      return topicInfoMap;
    }
  },


  // 初始化每日打卡
  initCheckCalendar: function () {
    if (this.data.topic_info_list == 0) return;
    let checked_data_list = this.data.checked_data_list;

    if (checked_data_list.length != 0) {
      this.setData({
        check_first_date: moment(checked_data_list[checked_data_list.length - 1].check_time).format('YYYY-MM-DD'), //所有卡片最早开始打卡的时间
        check_last_date: moment(checked_data_list[0].check_time).format('YYYY-MM-DD'), //所有卡片中最晚打卡的时间
      });
    }

    this.setData({
      current_date: moment().format('YYYY-MM-DD'),
    });
    this.fillCalendar(moment().format('YYYY-MM'));
  },





  /**
   * 初始化卡片数据
   */
  initTopicCheckData: function(){
    console.log('init topic check data')
    let topic_info = this.data.topic_info;
    let topic_name_list = [];
    for (let i in topic_info){
      topic_name_list.push(topic_info[i].topic_name);
    }
    
    this.setData({
      topic_name_list: topic_name_list,
      topic_index: 0
    })
 
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        wx.getSystemInfo({
          success: function (res) {
            that.getSystemWidget('.one-line-view', 'bottom', 1,
              (topPos) => {
                that.setData({
                  lineCanvasHeight: res.windowHeight - topPos,
                });
                data.lineChartOption.grid.height =
                  that.data.lineCanvasHeight - 50;
                data.lineChartOption.grid.width =
                  that.data.scrollWidth - 30;
                lineChart.setOption(data.lineChartOption);
                let topic_name = that.data.topic_name_list
                [that.data.topic_index];
                let [xTextList, yDataList] = data.
                      getLineCanvasData(that.data.
                        check_info_per_topic[topic_name]);
                let yName = that.data.topic_info_map[topic_name].topic_count_phase + 'n' + that.data.topic_info_map[topic_name].topic_count_unit;
                // 生成当前卡片canvas的数据
                that.newLineCanvas(xTextList, yDataList, yName);
              })
          }
        });
      }
    });
  },





  getSystemWidget: function(name, pos, index, cb) {
    wx.createSelectorQuery().selectAll(name).
      boundingClientRect((rects) => {
        if (pos == 'top') {
          cb(rects[index].top);
          // console.log(rects[0].top);
        } else if (pos == 'bottom') {
          cb(rects[index].bottom);
          // console.log(rects[0].bottom);
        }
        // let diff = res.windowHeight - rects[0].top;
        // console.log(diff)
      }).exec();
  },


  // 初始化历史日志tab
  initCheckLog: function(){
    if (this.data.topic_info_list == 0) return;

    let all_topic_info_map = this.data.topic_info_map;
    let completenessMap = data.getCompletenessMap(all_topic_info_map, this.data.check_time_per_topic);

    // 分割过期的和不过期的
    let dated_topic_info_map = {};
    let undated_topic_info_map = {};
    for (let topic_name in all_topic_info_map) {
      if (all_topic_info_map[topic_name].dated) 
        dated_topic_info_map[topic_name] = all_topic_info_map[topic_name];
      else
        undated_topic_info_map[topic_name] = all_topic_info_map[topic_name];
    }

    this.setData({
      completeness_map: completenessMap,
      undated_topic_info_map: undated_topic_info_map, 
      dated_topic_info_map: dated_topic_info_map,
      dated_topic_length: Object.keys(dated_topic_info_map).length
    });



    let completenessList = [];
    for (let name in completenessMap){
      completenessList.push(name);
      completenessList.push(completenessMap[name]);
    }

    /* 保存每个卡片的完成度的数据 */
    api.postRequest({
      'url': '/topic/saveCompleteRate',
      'data': {
        value_list: completenessList,
      },
      'success': (res) => {
        if (res.error_code == 200)
          console.log('更新完成度成功');
        else
          console.log('更新完成度失败');
      },
      'fail': (res) => {
        console.log('更新完成度失败');
      } 
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
    let checkedTime = [];
    if (this.data.topic_info.length != 0){
      let topic = this.data.topic_info[this.data.selected_topic_idx]['topic_name']; //当前选中的topic名
      checkedTime = this.data.check_time_per_topic[topic]; //当前选中的topic的所有check信息
    }
    var currentMoment = date.clone();
    var preMoment = date.clone().subtract(1, 'month');
    // var prepreMoment = date.clone().subtract(2, 'month');

    this.setData({
      'year_month_list[1]': data.getCalendar(checkedTime, currentMoment, colorList[currentMoment.month() % 2]),
      'year_month_list[0]': data.getCalendar(checkedTime, preMoment, colorList[preMoment.month() % 2]),
    });


    if (this.data.topic_info.length != 0){
      this.setData({
        selected_topic: this.data.topic_info[0]['topic_name'],
      });
    }
    this.setData({
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
    }else if (tabidx == 1){
      this.initTopicCheckData();
    }else if (tabidx == 2){
      this.initCheckLog();
    }
  },

  /**
   * 日历scroll-view滑动事件
   */
  calendarScroll: function (e) {
    if (e.detail.scrollTop == 0 ) {//上滑到顶了
      let currentSelectedDate = this.data.date.clone();
      let checkedTime = [];
      if (this.data.topic_info.length != 0) {
        let topic = this.data.topic_info[this.data.selected_topic_idx]['topic_name']; //当前选中的topic名
        checkedTime = this.data.check_time_per_topic[topic]; //当前选中的topic的所有check信息
      }

      let newDate = currentSelectedDate.clone().subtract(2, 'month');
      if (newDate < this.data.check_last_date ||
          this.data.check_last_date == '') {
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
        date: currentSelectedDate.clone().subtract(1, 'month'),
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
      selected_topic_idx: e.currentTarget.dataset.topicIdx
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
    let chosenDate = moment(e.currentTarget.dataset.currentDate, 'YYYY-MM-DD');
    if (chosenDate > moment()){
      content = '未来的事情宝宝无法预测嗷~';
    }else{
      let checkedDetail = this.data.checked_topic_list_per_day[chosenDate.format('YYYY-MM-DD')];
      checkedDetail = checkedDetail == undefined ? [] : checkedDetail

      let completeness = data.getCompletePercentageOfDay(
        chosenDate,
        this.data.checked_topic_list_per_day,
        this.data.topic_info.length, 
        this.data.start_date_list, 
        this.data.end_date_list);
      var content = '您在' + chosenDate.format('YYYY年MM月DD日');
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


  /*----------------------以下是卡片数据部分-----------------------*/
  changeTopic: function(e){
    this.setData({
      topic_index: e.detail.value
    })

    let topic_name = this.data.topic_name_list
                        [this.data.topic_index];
    let [xTextList, yDataList] = data.
      getLineCanvasData(this.data.
        check_info_per_topic[topic_name]);
    let yName = this.data.topic_info_map[topic_name].topic_count_phase +
          'n' + this.data.topic_info_map[topic_name].topic_count_unit;
    // 生成当前卡片canvas的数据
    this.newLineCanvas(xTextList, yDataList, yName);
  },

  newLineCanvas: function (xlist, ylist, yname) {
    setLineChart(xlist, ylist);
    yname = yname == 'n' ? '无': yname;
    this.setData({
      yList: ylist,
      yName: yname
    })
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
    console.log(this.data.check_info_per_topic)
    let topic_name = e.currentTarget.dataset.topicName;
    //当前topic的第idx个日志
    let topic_log_idx = e.currentTarget.dataset.idx; 
    let check_time = e.currentTarget.dataset.date;
    let check_timestamp = e.currentTarget.dataset.time;
    let log = e.currentTarget.dataset.log;
    let cur_word_left = this.data.word_left_num;
    let count_number = this.data.check_info_per_topic[topic_name][topic_log_idx].count;
    count_number = count_number == -1 ? '' : count_number;


    this.setData({
      topic_name: topic_name,
      topic_log_idx: topic_log_idx,
      check_time: check_time, 
      check_timestamp: check_timestamp,
      log: log,
      show_modal: true,
      word_left_num: cur_word_left - log.length,
      count_phase: this.data.topic_info_map[topic_name].topic_count_phase,
      count_number: count_number,
      count_unit: this.data.topic_info_map[topic_name].topic_count_unit
    });
  },





  /**
   * 长按日志，弹出删除窗口
   */
  longTapLog: function(e){
    let that = this;
    wx.showModal({
      title: '删除',
      content: '确定要删除这次打卡吗？删除操作不可恢复，且删除打卡会影响该卡片数据，以及连续、坚持天数喔',
      showCancel: true,
      success: (res)=>{
        if (!res.confirm) return;
        let topic_name = e.currentTarget.dataset.topicName,
          check_time = e.currentTarget.dataset.date,
          check_timestamp = e.currentTarget.dataset.time,
          insist_day = that.data.topic_info_map[topic_name].insist_day,
          idx = e.currentTarget.dataset.idx,
          new_check_info_per_topic = that.data.check_info_per_topic,
          new_check_info = new_check_info_per_topic[topic_name],
          last_check_time = '', reduce_day_num = 0,
          l = new_check_info.length;


        // 如果一天有两个日志，则不需要update user_topic的数据
        // 否则， 删掉日志则代表删掉一次打卡记录
        let lastDate = moment(new_check_info[0].check_time, 'YYYY-MM-DD')
        let ifTodayCheck = lastDate == moment().format('YYYY-MM-DD');
        let lastInsistDay = lastDate.clone().subtract(ifTodayCheck ? insist_day - 2 : insist_day - 1, 'days');
        reduce_day_num = moment(check_time, 'YYYY-MM-DD') >= 
                  lastInsistDay ? 1 : 0;
        // console.log(ifTodayCheck ? insist_day - 1 : insist_day)
        console.log(new_check_info[0].check_time)
        console.log(lastDate.format('YYYY-MM-DD'))
        console.log(lastInsistDay.format('YYYY-MM-DD'))
        for (let i in new_check_info) {
          let curDate = moment(check_time, 'YYYY-MM-DD');
          if (moment(new_check_info[i].check_time, 'YYYY-MM-DD') 
                >= curDate) continue;
          last_check_time = new_check_info[i].check_time;
          break;
        }
        console.log(last_check_time, reduce_day_num)
        api.postRequest({
          'url': '/topic/deleteCheck',
          'data':{
            topic_name: topic_name, 
            check_time: check_time,
            check_timestamp: check_timestamp,
            last_check_time: last_check_time,
            reduce_day_num: reduce_day_num
          },
          'success': (res) => {
            if (res.error_code != 200){
              console.log('删除打卡失败');
              return;
            }
            console.log('删除打卡成功');
            new_check_info.splice(idx, 1);
            console.log(new_check_info)
            new_check_info_per_topic[topic_name] = new_check_info
            that.setData({
              check_info_per_topic: new_check_info_per_topic
            });
          },
          'fail': (res) => { console.log('删除打卡失败');},
        });
      }
    })
  },

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
      log: '',
      count_number: ''
    });
  },


  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    api.postRequest({
      'url': '/topic/updateCheckLog',
      'data': {
        topic_name: this.data.topic_name,
        check_time: this.data.check_time,
        check_timestamp: this.data.check_timestamp,
        log: this.data.new_log,
        count: this.data.count_number
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
    if (this.data.new_log)
      check_info_per_topic[this.data.topic_name]
          [this.data.topic_log_idx]['log'] = this.data.new_log;
    if (this.data.count_number)
      check_info_per_topic[this.data.topic_name]
          [this.data.topic_log_idx]['count'] = this.data.count_number;

    this.setData({
      check_info_per_topic: check_info_per_topic
    });
    this.hideModal();
  },






  /**
   * 打卡计数变化
   */
  bindTopicCountNumberChange: function (e) {
    this.setData({
      count_number: e.detail.value
    })
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

  /** 
   * 页面隐藏函数
   * 监听页面的隐藏，
   * 当从当前A页跳转到其他页面，那么A页面处于隐藏状态
   * */
  onHide: function (event) {
  },
})





/**
 * 图表配置部分
 */
function initBarChart(canvas, width, height) { //初始化每日完成度图表
  barChart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(barChart);
  return barChart;
}


function setLineChart(xdata, ydata) {
  data.lineChartOption.xAxis[0].data = xdata;
  data.lineChartOption.series[0].data = ydata;
  // option.series[1].data = ydata;
  lineChart.setOption(data.lineChartOption);
};

function initLineChart(canvas, width, height) { //初始化卡片数据图表
  lineChart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(lineChart);
  return lineChart;
}