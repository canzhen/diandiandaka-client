const api = require('../../ajax/api.js');
const moment = require('../../vendor/moment.min.js');
const weekList = ['一', '二', '三', '四', '五', '六', '七'];
const yearList = ['1月', '2月', '3月', '4月', '5月', '6月', '7月',
  '8月', '9月', '10月', '11月', '12月'];



/* 获取当前用户具体打卡信息 */
function getCheckDataList(cb){
  api.postRequest({
    'url': '/topicCheck/getAll',
    'data': {},
    'success': (res) => {
      console.log('从数据库中获取用户具体每日打卡信息成功');
      cb(res.error_code, res.msg, res.result_list);
    },
    'fail': (res) => {
      console.log('从数据库中获取用户具体每日打卡信息失败');
      cb(100, '', []);
    }
  });
}

/* 获取当前用户的卡片信息 */
function getTopicInfoList(cb) {
  api.postRequest({
    'url': '/userTopic/getTopicListByUserId',
    'data': [],
    'showLoading': true,
    'success': (res) => { //成功
      cb(res.error_code, res.msg, res.result_list)
    },
    'fail': (res) => { //失败
      cb(100, '', []);
    }
  });

}



function getCheckedDataOfEveryTopic(dataList, topicList) {
  var checkTimePerTopic = new Map(); //check time只有时间 
  var checkInfoPerTopic = new Map(); //check info还包括log
  for (var i = 0; i < topicList.length; i++){
    checkTimePerTopic[topicList[i]] = new Set(); //去重，初始化
    checkInfoPerTopic[topicList[i]] = []; //去重，初始化
  }

  for (var i = 0; i < dataList.length; i++){
    checkTimePerTopic[dataList[i]['topic_name']]
        .add(dataList[i]['check_time']);
    checkInfoPerTopic[dataList[i]['topic_name']].push({
      'check_time': dataList[i]['check_time'],
      'check_timestamp': dataList[i]['check_timestamp'],
      'log': dataList[i]['log']
    });
  }

  for (var i = 0; i < topicList.length; i++){
    checkTimePerTopic[topicList[i]] = Array.from(checkTimePerTopic[topicList[i]]); //重新变成Array
    // checkInfoPerTopic[topicList[i]] = Array.from(checkTimePerTopic[topicList[i]]); //重新变成Array
  }
    
  return [checkTimePerTopic, checkInfoPerTopic];
}




// 把TopicInfo按照每size一组，分组
function divideTopicInfoIntoGroups(dataMap, allTopic, size) {
  var count = 0, dividedList = [], tmpList = [];
  // 每size个，分成一组
  for (var i in allTopic) {
    if (count == size) {
      dividedList.push(tmpList);
      tmpList = [];
      count = 0;
    }
    let info = allTopic[i];
    tmpList.push({
      'topic_name': info.topic_name,
      'topic_url': info.topic_url,
      'number': count, //第n组的第number个，用于计算在总数组中的位置
      'insist_day': info.insist_day
    });
    count++;
  }

  dividedList.push(tmpList);
  return dividedList;
}



/*
@param checkedList [{'topic':'减肥', 'created_time':'2018-06-23'}, {}, {}, ...]
@param givenDate '2018-07-02'
*/
function getCheckDetailOnGivenDay(checkedList, givenDate) {
  var checkedTopicList = [];
  for (var i = 0; i < checkedList.length; i++) {
    if (checkedList[i].check_time === givenDate)
      checkedTopicList.push(checkedList[i].topic_name);
  }
  return checkedTopicList;
}



function _getCanvasData(percentageList, startdate, enddate, 
              check_time_list, topic_list_per_day, total_topic_num,     
              ifAverage, ifAddXTestList = false, xTextList=null, ) {

  let allZero = true;
  let diff = parseInt(enddate.diff(startdate, 'days'));
  if (!ifAverage){
    for (let i = diff; i >= 0; i--) {
      let percentage = 0.0;
      let date = moment(enddate).subtract(i, 'days');
      let formatDate = date.format('YYYY-MM-DD');
      if (ifAddXTestList)
        xTextList.push(date.format('MM月DD日'));
      if (check_time_list.indexOf(formatDate) != -1)
        percentage = topic_list_per_day[formatDate].length / total_topic_num * 100;
      percentage = percentage ? parseFloat(percentage.toFixed(1)) : null;
      if (!percentage) allZero = false;
      percentageList.push(percentage);
    }
  }else{
    let curMonth = 0; //下标从0开始，0代表1月
    let validDaysPerMonth = 0;
    let tmpList = [];
    for (let i = diff; i >= 0; i--) {
      let percentage = 0.0;
      let date = moment(enddate).subtract(i, 'days');

      if (date.month() > curMonth) { //进入到下一个月了
        if (validDaysPerMonth == 0) percentageList.push(null);
        else{
          let sum = 0;
          for (let j in tmpList) {
            sum += tmpList[j];
            // console.log(tmpList[j]);
          }
          percentage = sum ? parseFloat((sum / validDaysPerMonth).toFixed(1)) : null;
          percentageList.push(percentage)
        }
        // console.log('current month: ' + parseInt(curMonth + 1))
        // console.log('sum: '+sum)
        // console.log(tmpList)
        // console.log('current month valid days: ' + validDaysPerMonth)

        validDaysPerMonth = 0; //清零
        tmpList = []; //清空tmpList
        curMonth += 1; //把当前月份加一
      }

      let formattedDate = date.format('YYYY-MM-DD');
      // console.log(formattedDate)

      if (check_time_list.indexOf(formattedDate) != -1){
        validDaysPerMonth+=1;
        percentage = topic_list_per_day[formattedDate].length / total_topic_num * 100;
      }
      if (!percentage) allZero = false;
      tmpList.push(percentage);
    }
  }

  if (allZero) percentageList = [];
}



/**
 * 获取本周的周一的日期
 */
function getWeekStartDate(date) {
  var currentdate = moment(date);
  let weekOfDay = parseInt(currentdate.format('E'));
  return currentdate.subtract(weekOfDay - 1, 'days');//周一日期
}


/**
 * 获取本周日的时间
 */
function getWeekEndDate(date) {
  var currentdate = moment(date);
  let weekOfDay = parseInt(currentdate.format('E'));
  return currentdate.add(7 - weekOfDay, 'days');//周日日期
}


/**
 * 计算获得每日完成度：
 */
function getCanvasData(
            check_time_list, 
            topic_list_per_day, 
            current_date, 
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
      enddate = moment(enddate).endOf('month');
      startdate = moment(enddate).startOf('month')

      xTextList = getDaysListOfGivenMonth(
        enddate.year(), enddate.month() + 1);
      break;
    case "1年":
      if (n != 0) enddate = moment(enddate).add(n, 'year');
      enddate = enddate.endOf('year');
      startdate = moment(enddate).startOf('year');
      ifAverage = true;
      xTextList = yearList;
      break;
    case "全部":
      // check_time_list是按照时间降序排列的
      // 所以直接第一个是enddate和最后一个就是startdate
      enddate = moment(check_time_list[0], 'YYYY-MM-DD');
      startdate = moment(check_time_list[check_time_list.length - 1], 'YYYY-MM-DD');
      ifAddXTextList = true;
      break;
    default:
      break;
  }
  _getCanvasData(percentageList, startdate, enddate, check_time_list,
                 topic_list_per_day, total_topic_num, ifAverage,
                 ifAddXTextList, xTextList);

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
  console.log(arr)


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


  console.log(ans)

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
    let time = checked_data_list[i]['check_time'];
    checkedTimeList.add(time);
    if (map[time] == undefined) 
      map[time] = [];
    map[time].push(checked_data_list[i]['topic_name']);
  }
  return [Array.from(checkedTimeList), map];
}




module.exports = {
  getCheckDataList,
  getTopicInfoList,
  getCheckedDataOfEveryTopic,
  divideTopicInfoIntoGroups,
  getCheckDetailOnGivenDay,
  getCanvasData,
  getTopicListPerDay,
  getCalendar,
}
