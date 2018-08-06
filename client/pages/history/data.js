const api = require('../../ajax/api.js');
const moment = require('../../vendor/moment.min.js');

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

function _getCanvasData(percentageList, startdate, enddate, check_time_list, topic_list_per_day, total_topic_num){
  let diff = enddate.diff(startdate) / (1000 * 60 * 60 * 24);
  for (let i = diff; i >= 0; i--) {
    let date = moment(enddate).subtract(i, 'days').format('YYYY-MM-DD');
    let percentage = 0;
    if (check_time_list.indexOf(date) != -1)
      percentage = topic_list_per_day[date].length / total_topic_num * 100;
    let p = parseInt(percentage.toFixed(2));
    if (!p) percentageList.push(null);
    else percentageList.push(p);
  }
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
  let enddate = moment(current_date);
  let startdate = moment(current_date);

  if (n != -1 && n != 1 && n != 0) return;

  switch (time_lapse) {
    case "1周":
      if (n != 0) startdate.add(n * 7, 'days');
      startdate = getWeekStartDate(startdate);
      enddate = getWeekEndDate(startdate);
      break;
    case "1个月":
      enddate.add(n, 'month');
      enddate = moment(enddate).endOf('month');
      startdate = moment(enddate).startOf('month')
      break;
    case "3个月":
      enddate = moment(enddate).add(3 * n, 'month').endOf('month');
      startdate = moment(enddate).subtract(3, 'month')
      break;
    case "1年":
      if (n != 0) enddate = moment(enddate).add(n, 'year');
      enddate = enddate.endOf('year');
      startdate = moment(enddate).startOf('year');
      break;
    case "全部":
      break;
    default:
      break;
  }


  _getCanvasData(percentageList, startdate, enddate, check_time_list, 
                  topic_list_per_day, total_topic_num);

  let subtitle = startdate.format('YYYY-MM-DD') + ' 到 ' + enddate.format('YYYY-MM-DD');

  return {'data': percentageList, 
          'subtitle': subtitle, 
          'startdate': startdate,
          'enddate': enddate, };
};


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
}
