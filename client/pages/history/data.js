const api = require('../../ajax/api.js');
const moment = require('../../vendor/moment.js');
const weekList = ['一', '二', '三', '四', '五', '六', '七'];
const yearList = ['1月', '2月', '3月', '4月', '5月', '6月', '7月',
  '8月', '9月', '10月', '11月', '12月'];

const timelapses = [ //所有的时间区间的选项
  { 'name': '1周', 'checked': true },
  { 'name': '1个月', 'checked': false },
  { 'name': '1年', 'checked': false },
  { 'name': '全部', 'checked': false }];



/**
 * 每日完成度柱状图配置
 */
var barChartOption = {
  color: ['#37a2da', '#32c5e9', '#67e0e3'],
  grid: {
    top: 0,
    // left: 5,
    // right: 10,
    // bottom: 10,
    // width: 300,
    // height: 370,
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
    max: 100,
  },
  series: [{ //柱状图
    type: 'bar',
    data: [],
    markLine: {
      data: [{ type: 'average' }],
      label: {
        show: true,
        position: 'middle',
        formatter: '平均{c}%',
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
  }]
};




/**
 * 卡片折线图配置
 */
var lineChartOption = {
  color: ['#37a2da', '#32c5e9', '#67e0e3'],
  grid: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    // width: 340,
    // height: 30,
    containLabel: true
  },
  xAxis: [{
    type: 'category',
    data: [],
    silent: true,
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    // axisLabel: {
    //   margin: 10,
    //   textStyle: {
    //     color: '#888888'
    //   }
    // }
  }],
  yAxis: {
    show: true,
    silent: true,
    nameLocation: 'middle',
    axisLine: {
      show: false
    },
  },
  series: [{ //曲线
    type: 'line',
    data: [],
    showSymbol: true,
    showAllSymbol: true,
    'symbol': 'circle', //折线点设置为实心点
    symbolSize: 100, //折线点的大小
    // silent: true,
    // smooth: true,
    animation: false,
    // clickable: false,
    itemStyle: {
      normal: {
        color: 'rgba(136, 136, 136, 0.5)',
        barBorderRadius: 0,
      }
    },
    lineStyle: {
      color: '#feddbb'
    },
    areaStyle: {
      color: '#feddbb',
      smooth: true,
    },
    label: {
      show: true,
      position: 'top',
      formatter: '平均{c}%',
      distance: 20
    },
  }]
};








/* 获取当前用户具体打卡信息 */
function getCheckDataList(cb){
  api.postRequest({
    'url': '/topic/getAllCheckDataOfUser',
    'data': {},
    'success': (res) => {
      if (res.error_code != 200) {
        console.log('从数据库中获取用户具体每日打卡信息失败');
        cb(res.error_code, '', []);
        return;
      }
      console.log('从数据库中获取用户具体每日打卡信息成功');
      cb(res.error_code, res.msg, res.result_list);
    },
    'fail': (res) => {
      console.log('从数据库中获取用户具体每日打卡信息失败');
      cb(res.error_code, '', []);
    }
  });
}



/* 获取当前用户的卡片信息 */
function getTopicInfoList(cb) {
  api.postRequest({
    'url': '/topic/getUserTopic',
    'data': [],
    'showLoading': true,
    'success': (res) => { //成功
      if (res.error_code != 200) {
        console.log('从数据库中获取用户卡片信息失败');
        cb(res.error_code, '', []);
        return;
      }
      console.log('从数据库中获取用户卡片信息成功');
      cb(res.error_code, res.msg, res.result_list)
    },
    'fail': (res) => { //失败
      console.log('从数据库中获取用户卡片信息失败');
      cb(res.error_code, '', []);
    }
  });
}



function getCheckedDataOfEveryTopic(dataList, topicInfoMap) {
  var checkTimePerTopic = new Map(); //check time只有时间 
  var checkInfoPerTopic = new Map(); //check info还包括log
  for (let key in topicInfoMap){
    checkTimePerTopic[key] = new Set(); //去重，初始化
    checkInfoPerTopic[key] = []; //去重，初始化
  }
  
  for (var i = 0; i < dataList.length; i++){
    checkTimePerTopic[dataList[i]['topic_name']]
        .add(dataList[i]['check_time']);
    checkInfoPerTopic[dataList[i]['topic_name']].push({
      'check_time': dataList[i]['check_time'],
      'check_timestamp': dataList[i]['check_timestamp'],
      'count': dataList[i]['count'],
      'log': dataList[i]['log']
    });
  }

  for (let key in topicInfoMap){
    checkTimePerTopic[key] = Array.from(checkTimePerTopic[key]); //重新变成Array
  }

  return [checkTimePerTopic, checkInfoPerTopic];
}




// 把TopicInfo按照每size一组，分组
// function divideTopicInfoIntoGroups(dataMap, allTopic, size) {
//   var count = 0, dividedList = [], tmpList = [];
//   // 每size个，分成一组
//   for (var i in allTopic) {
//     if (count == size) {
//       dividedList.push(tmpList);
//       tmpList = [];
//       count = 0;
//     }
//     let info = allTopic[i];
//     tmpList.push({
//       'topic_name': info.topic_name,
//       'topic_url': info.topic_url,
//       'number': count, //第n组的第number个，用于计算在总数组中的位置
//       'insist_day': info.insist_day
//     });
//     count++;
//   }

//   dividedList.push(tmpList);
//   return dividedList;
// }



/*
@param checkedList [{'topic':'减肥', 'created_time':'2018-06-23'}, {}, {}, ...]
@param givenDate '2018-07-02'
*/
function getCheckDetailOnGivenDay(checkedList, givenDate) {
  var checkedTopicList = new Set();
  for (var i = 0; i < checkedList.length; i++) {
    if (checkedList[i].check_time === givenDate.format('YYYY-MM-DD'))
      checkedTopicList.add(checkedList[i].topic_name);
  }
  return Array.from(checkedTopicList);
}


/**
 * 获取某一天的完成度百分比
 * 起始日期是左开右闭
 */
function getCompletePercentageOfDay(currentdate, topic_list_per_day, total_topic_num, start_date_list, end_date_list) {
  if (currentdate.diff(moment(), 'days') > 0) {
    return null; //未来无法计算
  }
  if (currentdate < start_date_list[0]) return null; //之前并没有任何卡片开始
  if (topic_list_per_day[currentdate.format('YYYY-MM-DD')] == undefined) {
    return 0;
  }

  currentdate = currentdate.clone();
  let l = start_date_list.length;
  let total_num = 0;

  // 如果时间位于最晚开始和最早结束的卡片之间，则总数为卡片总数
  if (currentdate < end_date_list[0] && currentdate >= start_date_list[l-1]){
    total_num = l;
  // 如果时间位于最早开始之前，或者最晚结束之后，总数为0
  }else if (currentdate < start_date_list[0] || 
    currentdate >= end_date_list[l - 1]) {
    total_num = 0;
  // 否则，位于最早开始和最晚开始之间，每往前推时间，减少一个卡片
  }else if (currentdate < start_date_list[l-1]){
    for (let i = 1; i < l; i++){
      if (currentdate >= start_date_list[l-1-i]){
        total_num = l - i;
        break;
      }
    }
  // 否则，位于最晚结束和最早结束之间，每向后推时间，减少一个卡片
  } else if (currentdate >= end_date_list[0]) {
    for (let i = 1; i < l; i++){
      if (currentdate < end_date_list[i]){
        total_num = l - i; 
        break;
      }
    }
  }
  
  if (!total_num) return null;

  let percentage = (topic_list_per_day[currentdate.format('YYYY-MM-DD')].length / total_num * 100 ).toFixed(2);
  percentage = percentage ? parseFloat(percentage) : null;

  return percentage;
}



function _getBarCanvasData(percentageList, startdate, enddate, 
          start_date_list, end_date_list, check_time_list,
          topic_list_per_day,total_topic_num, ifAverage, 
          ifAddXTestList = false, xTextList=null, ) {

  let allZero = true;
  let diff = parseInt(enddate.diff(startdate, 'days'));
  if (!ifAverage){
    for (let i = diff; i >= 0; i--) {
      let percentage = 0.0;
      let date = enddate.clone().subtract(i, 'days');
      let formatDate = date.format('YYYY-MM-DD');
      if (ifAddXTestList)
        xTextList.push(date.format('MM月DD日'));
      percentage = getCompletePercentageOfDay(date,topic_list_per_day, total_topic_num, start_date_list, end_date_list);
      if (percentage) allZero = false;
      percentageList.push(percentage);
    }
  }else{
    let curMonth = 0; //下标从0开始，0代表1月
    let validDaysPerMonth = 0;
    let tmpList = [];
    for (let i = diff; i >= 0; i--) {
      let percentage = 0.0;
      let date = enddate.clone().subtract(i, 'days');

      if (date.month() > curMonth) { //进入到下一个月了
        if (validDaysPerMonth == 0) percentageList.push(null);
        else{
          let sum = 0;
          for (let j in tmpList) 
            sum += tmpList[j];
          percentage = sum ? parseFloat((sum / validDaysPerMonth).toFixed(1)) : null;
          percentageList.push(percentage)
        }

        validDaysPerMonth = 0; //清零
        tmpList = []; //清空tmpList
        curMonth += 1; //把当前月份加一
      }

      percentage = getCompletePercentageOfDay(date, topic_list_per_day, total_topic_num, start_date_list, end_date_list);
      if (percentage != null) validDaysPerMonth += 1;

      if (!percentage) allZero = false;
      tmpList.push(percentage);
    }
  }

  if (allZero) percentageList = [];
}




/**
 * 计算获得单个卡片的
 */
function getLineCanvasData(check_time_list){
  // check_time_list默认按照时间排序，
  // 所以第一个就是最靠近当前日期的，
  // 最后一个是最早的日期的
  let l = check_time_list.length;
  let xTextList = [];
  let yDataList = [];

  if (l == 0) return [xTextList, yDataList];

  for (let i = l - 1; i >= 0; i--){
    let check_info = check_time_list[i];
    if (check_info.count == -1) continue;
    let simplifiedTime = check_info.check_time;
    let timeList = simplifiedTime.split('-');
    xTextList.push(timeList[1] + '.' + timeList[2]);
    yDataList.push(check_info.count);
  }

  // console.log(xTextList, yDataList)

  return [xTextList, yDataList];
}




/**
 * 计算获得每日完成度
 */
function getBarCanvasData(
            check_time_list, 
            topic_list_per_day, 
            current_date, 
            start_date_list, 
            end_date_list, 
            total_topic_num,
            time_lapse,
            n){

  var percentageList = [];
  let enddate = moment(current_date, 'YYYY-MM-DD');
  let startdate = moment(current_date, 'YYYY-MM-DD');
  let xTextList = [];
  let ifAverage = false;
  let ifAddXTextList = false;

  if (n != -1 && n != 1 && n != 0) return;

  switch (time_lapse) {
    case "1周":
      if (n != 0) startdate.add(n * 7, 'days');
      startdate = getWeekStartDate(startdate);
      enddate = getWeekEndDate(startdate);

      xTextList = weekList;
      break;
    case "1个月":
      enddate.add(n, 'month');
      enddate = enddate.clone().endOf('month');
      startdate = enddate.clone().startOf('month')

      xTextList = getDaysListOfGivenMonth(
        enddate.year(), enddate.month() + 1);
      break;
    case "1年":
      if (n != 0) enddate = enddate.clone().add(n, 'year');
      enddate = enddate.endOf('year');
      startdate = enddate.clone().startOf('year');
      ifAverage = true;
      xTextList = yearList;
      break;
    case "全部":
      if (check_time_list.length != 0){
        // check_time_list是按照时间降序排列的
        // 所以直接第一个是enddate和最后一个就是startdate
        enddate = moment(check_time_list[0], 'YYYY-MM-DD');
        startdate = moment(check_time_list[check_time_list.length - 1], 'YYYY-MM-DD');
      }else{
        enddate = startdate = moment();
      }
      ifAddXTextList = true;
      break;
    default:
      break;
  }

  if (startdate <= moment()) {
    // 计算数据
    _getBarCanvasData(percentageList, startdate, enddate, start_date_list, end_date_list, check_time_list, topic_list_per_day, total_topic_num, ifAverage, ifAddXTextList, xTextList);
  }
  let subtitle = startdate.format('YYYY-MM-DD') + ' 到 ' + enddate.format('YYYY-MM-DD');


  return {'ydata': percentageList, 
          'xtext': xTextList, //x轴横坐标的值
          'subtitle': subtitle, 
          'startdate': startdate,
          'enddate': enddate, };
};



/**
 * 获取某一年各月的天数
 */
function getDaysOfGivenMonth(year) {
  return [31, 28 + isLeap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}


/**
 * 获取某一年某一个月的日期列表
 */
function getDaysListOfGivenMonth(year, month) {
  let daysNum = getDaysOfGivenMonth(year)[month - 1];
  let daysList = [];
  for (let i = 1; i <= daysNum; i++) {
    daysList.push(i);
  }
  return daysList;
};


/**
 * 判断闰年还是平年
 */
function isLeap(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0 ? true : false;
}




/**
 * 获取本周的周一的日期
 */
function getWeekStartDate(date) {
  var currentdate = date.clone();
  let weekOfDay = parseInt(currentdate.format('E'));
  return currentdate.subtract(weekOfDay - 1, 'days');//周一日期
}


/**
 * 获取本周日的时间
 */
function getWeekEndDate(date) {
  var currentdate = date.clone();
  let weekOfDay = parseInt(currentdate.format('E'));
  return currentdate.add(7 - weekOfDay, 'days');//周日日期
}

/**
 * 补充0
 */
function addZero(num) {
  return num < 10 ?
    num.toString().length <= 1 ? '0' + num : num.toString() :
    num.toString();
}

/**
 * 获取某年某月的第一天是星期几
 */
function getFirstDayofGivenMonth(currentMoment) {
  let day = parseInt(currentMoment.startOf('month').format('d'));
  return day == 0 ? 7 : day;
}


/**
 * 获取每个月的天数数组
 * @param checkedDataList 该月份被checked的天数 ['2018-04-23', '2018-05-30', ...]
 * @param year 要生成的年份
 * @param month 要生成的月份
 * @param color 当前月份的‘年月小圆圈’要显示的颜色 #f8d2e9
 */
function getCalendar(checkedDataList, currentMoment, color) {
  var arr = [];
  // 根据某年某月的第一天是星期几来填充空值
  for (let j = 1; j < getFirstDayofGivenMonth(currentMoment); j++)
    arr.push(' ');

  // 根据当前月有多少天，循环把日期放入数组
  for (let i = 0; i < getDaysOfGivenMonth(currentMoment.year())[currentMoment.month()]; i++) {
    let day = addZero(i + 1);
    let value = currentMoment.format('YYYY-MM-') + day;
    let checked = false;
    if (checkedDataList.indexOf(value) != -1)
      checked = true;//该天的数据是被打卡的
    arr.push({
      '_day': day,
      '_checked': checked
    });
  }


  // 将得出的数组每7个分成一组
  var splitedArr = [], tmpArr = [], count = 0;
  // 先输入"一二三四五六日"
  var days = ['一', '二', '三', '四', '五', '六', '日'];
  for (var i in days) tmpArr.push({ '_day': days[i], '_checked': false });
  splitedArr.push(tmpArr);

  tmpArr = [];
  for (let idx = 0; idx < arr.length; idx++) {
    if (count == 7) {
      splitedArr.push(tmpArr);
      count = 0;
      tmpArr = [];
    }
    tmpArr[count++] = arr[idx];
  }

  //补齐剩下的空格
  while (count < 7) tmpArr[count++] = ' ';
  splitedArr.push(tmpArr);

  //最后补充上year和month的字段
  var ans = new Map();
  ans['days'] = splitedArr;
  ans['year'] = currentMoment.year();
  ans['month'] = addZero(currentMoment.month()+1);
  ans['background'] = color;
  ans['selected_row'] = 0;

  return ans;
}


/**
 * 返回所有打卡时间的列表以及
 * {时间：卡片列表}的map
 */
function getTopicListPerDay(checked_data_list){
  var map = new Map(); //{time: topic_list}
  var checkedTimeList = new Set();
  for (let i in checked_data_list){
    let data = checked_data_list[i];
    let time = data['check_time'];
    checkedTimeList.add(time);
    if (map[time] == undefined) 
      map[time] = new Set();
    map[time].add(data['topic_name']);
  }
  for (let key in map)
    map[key] = Array.from(map[key]);
  return [Array.from(checkedTimeList), map];
}



function getStartEndDateList(topic_info_list) {
  let start_date_list = [];
  let end_date_list = [];
  for (let i in topic_info_list) {
    start_date_list.push(moment(topic_info_list[i]['start_date'], 'YYYY-MM-DD'));
    end_date_list.push(moment(topic_info_list[i]['end_date'] != '永不结束' ? topic_info_list[i]['end_date'] : '9999-99-99', 'YYYY-MM-DD'));
  }

  function cmp(a, b){
    return a>b;
  }
  start_date_list.sort(cmp);
  end_date_list.sort(cmp);

  return [start_date_list, end_date_list];
}

/**
 * 2018.08.08 22:37
 * 自己想了个高级算法，哈哈哈哈哈！！！
 * @author: Canzhen Zhou
 */
function getTotalTopicNumPerDay(check_last_date, topic_info_list){
  let totalNumPerDay = {};
  let start_date_list = [];
  let end_date_list = [];
  for (let i in topic_info_list){
    start_date_list.push(topic_info_list[i]['start_date'])
    end_date_list.push(topic_info_list[i]['end_date'] != '永不结束' ? topic_info_list[i]['end_date']: '9999-99-99')
  }
  start_date_list.sort();
  end_date_list.sort();
  let prestartdate = '';
  let preenddate = '';

  let l = topic_info_list.length;
  for (let i = 0; i < l; i++) {
    let startdate = moment(start_date_list[l-1-i], 'YYYY-MM-DD');
    let enddate = moment(end_date_list[i], 'YYYY-MM-DD');
    enddate = enddate == '9999-99-99' ? moment(this.check_last_date, 'YYYY-MM-DD') : enddate;
    if (!prestartdate){
      let diff = parseInt(enddate.diff(startdate, 'days'));
      for (let j = diff; j > 0; j--) {
        let date = enddate.clone().subtract(j, 'days').format('YYYY-MM-DD');
        totalNumPerDay[date] = l - i;
      }
    } else {
      let diff = parseInt(enddate.diff(preenddate, 'days'));
      for (let j = diff; j > 0; j--) {
        let date = enddate.clone().subtract(j, 'days').format('YYYY-MM-DD');
        totalNumPerDay[date] = l - i;
      }
      let diff2 = parseInt(prestartdate.diff(startdate, 'days'));
      for (let j = diff2; j > 0; j--) {
        let date = prestartdate.clone().subtract(j, 'days').format('YYYY-MM-DD');
        totalNumPerDay[date] = l - i;
      }
    }
    prestartdate = startdate;
    preenddate = enddate;
  }

  console.log(totalNumPerDay);
  return totalNumPerDay;
}


/**
 * 计算每个topic的完成度
 * @param check_time_per_topic: ['topic_name': time_list,'':[],..]
 */
function getCompletenessMap(topic_info_map, check_time_per_topic){
  let map = {};
  for (let topic in topic_info_map){
    let totalDays = 0;
    let endDate = moment(topic_info_map[topic].end_date, 'YYYY-MM-DD');
    let startDate = moment(topic_info_map[topic].start_date, 'YYYY-MM-DD');
    if (moment().diff(endDate, 'days') > 0)
      totalDays = endDate.diff(startDate, 'days') + 1;
    else 
      totalDays = moment().diff(startDate, 'days') + 1;
    let validDays = check_time_per_topic[topic].length;
    map[topic] = parseFloat((validDays / totalDays) *100).toFixed(2);
  }
  return map;
}

module.exports = {
  getCheckDataList,
  getTopicInfoList,
  getCheckedDataOfEveryTopic,
  getCheckDetailOnGivenDay,
  getBarCanvasData,
  getLineCanvasData,
  getTopicListPerDay,
  getTotalTopicNumPerDay,
  getStartEndDateList,
  getCalendar,
  getCompletePercentageOfDay,
  getCompletenessMap,

  barChartOption,
  lineChartOption,
  timelapses
}
