const moment = require('./moment.min.js');

/**
 * 用户登录，无须让用户授权，在后端保存用户的openid，
 * 名字和头像可以暂时为空，前端保存用户sessionid，
 * 每次发送post请求会在header里带一个sessionid，
 * sessionid的header这个功能直接写在api.js里了，封装在每个post请求里
 */
function login(cb) {
  const api = require('../ajax/api.js');
  wx.login({ //用户登录
    success(loginResult) {
      console.log('登录成功');
      let code = loginResult.code;
      api.postRequest({
        'url': '/user/login',
        'data': {
          'code': code,
        },
        'success': (res) => {
          setStorageSync('sessionId', res.sessionId, 1000 * 60 * 60 * 2); //服务端的session也是默认2小时过期
          cb(res);
        },
        'fail': function (res) {
          console.log('更新或添加用户登录状态失败，请检查网络状态');
        }
      });
    },
    fail(loginError) {
      console.log('微信登录失败，请检查网络状态');
    }
  })
}

/**
 * 设置缓存
 * @param key: 键
 * @param value: 值
 * @param expiration: 过期时间，单位为毫秒
 * @param cb: 回调函数
 * @param return: true/false
 */
function setStorageSync(key, data, expiration){
  var timestamp = Date.parse(new Date());
  var expiration_time = timestamp + expiration;
  wx.setStorageSync(key.toString(), data);
  wx.setStorageSync(key.toString() + '_expiration', expiration_time);
  console.log('set key: ' + key + ', value: ' + JSON.stringify(data) + 
              'expiration time:' + expiration_time);
}


/**
 * 获取缓存数据
 * 如果缓存存在且没过期，则返回；
 * 否则返回false
 */
function getStorageSync(key) {
  var timestamp = Date.parse(new Date());
  var expiration = wx.getStorageSync(key + '_expiration');
  var data = wx.getStorageSync(key);


  console.log('get key: ' + key +
    ', expiration time:' + expiration + ', current time is : ' + timestamp);

  if (data && expiration > timestamp){
    return data;
  } else {
    if (data) { //过期了
      wx.clearStorageSync(key);
      wx.clearStorageSync(key + '_expiration');
    }
    // 从服务端拉取数据
    return '';
  }
}

/**
 * 计算下标
 */
function getSubscriptByLength(l, numEachRow){
  /* 动态创建my_topic_data_num作为分行下标 */
  var r = parseInt(l / numEachRow),
      c = l % numEachRow;
  if (c == 0) {
    c = numEachRow;
    r -= 1;
  }
  // console.log(l)
  // console.log(r)
  // console.log(c)
  var temp_topic_data_num = new Array();
  for (var r1 = 0; r1 <= r; r1++) {
    temp_topic_data_num[r1] = new Array();
    if (r1 == r) {
      for (var c1 = 0; c1 < c; c1++)
        temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    } else {
      for (var c1 = 0; c1 < numEachRow; c1++)
        temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    }
  }
  // console.log(temp_topic_data_num)
  return temp_topic_data_num;
}


/**
  判断闰年还是平年
*/
function isLeap (year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0 ? true : false;
}

/**
  获取某一年各月的天数
*/
function getDaysOfGivenMonth(year) {
  return [31, 28 + isLeap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

/*
 获取某年某月的第一天是星期几
 */
function getFirstDayofGivenMonth (date) {
  let day = new Date(date + '-1').getDay();
  return day == 0 ? 7 : day;
}

/*
补充0
*/
function addZero(num) {
  return num < 10 ? 
         num.toString().length <= 1 ? '0' + num : num.toString() : 
         num.toString();
}


/*
获取每个月的天数数组
@param checkedDataList 该月份被checked的天数 ['2018-04-23', '2018-05-30', ...]
@param year 要生成的年份
@param month 要生成的月份
@param color 当前月份的‘年月小圆圈’要显示的颜色 #f8d2e9
 */
function generateCalendar(checkedDataList, year, month, color) {
  var arr = [];
  // 根据某年某月的第一天是星期几来填充空值
  for (let j = 1; j < getFirstDayofGivenMonth(year + '-' + month); j++)    
    arr.push(' ');
  // 根据当前月有多少天，循环把日期放入数组
  for (let i = 0; i < getDaysOfGivenMonth(year)[month-1]; i++) {
    let value = year + '-' + addZero(month) + '-' + addZero(i + 1);
    let day = addZero(i + 1);
    var checked = false;
    if (checkedDataList.indexOf(value) != -1) checked = true;//该天的数据是被打卡的
    arr.push({
      '_day': day,
      '_checked': checked
    });

  }

  // 将得出的数组每7个分成一组
  var splitedArr = [], tmpArr = [], count = 0;
  // 先输入"一二三四五六日"
  var days = ['一', '二', '三', '四', '五', '六', '日'];
  for (var i in days) tmpArr.push({ '_day': days[i], '_checked':false});
  splitedArr.push(tmpArr);

  tmpArr = [];
  for (let idx = 0; idx < arr.length; idx++){
    if (count == 7) {
      splitedArr.push(tmpArr);
      count = 0;
      tmpArr = [];
    }
    tmpArr[count++] = arr[idx];
  }

  //补齐剩下的空格
  while(count < 7) tmpArr[count++] = ' ';
  splitedArr.push(tmpArr);

  //最后补充上year和month的字段
  var ans = new Map();
  ans['days'] = splitedArr;
  ans['year'] = year;
  ans['month'] = addZero(month);
  ans['background'] = color;
  ans['selected_row'] = 0;

  return ans;
}

/**
 * 获取格式化日期和时间，英文版
 */
function getFormateDatetimeEN(date) {
  return moment().format('YYYY.MM.DD hh:mm');
}


/**
 * 给year，month和day，返回'2018-07-08'格式的string
 */
function getFullDateSlash(year, month, day) {
  return moment().format("YYYY-MM-DD");
}

/**
 * 返回年月，并以'-'连接
 */
function getYearMonthSlash(date){
  return moment(date).format('YYYY-MM');
}

// function getAllTopicList(dataList){
//   var allTopicList = new Set(); //去重
//   for (var i = 0; i < dataList.length; i++){
//     allTopicList.add(dataList[i].topic);
//   }
//   return Array.from(allTopicList);
// }


function getCheckedDataOfEveryTopic(dataList, topicList){
  var checkedDataOfTopic = new Map();
  for (var i = 0; i < topicList.length; i++)
    checkedDataOfTopic[topicList[i]] = new Set(); //去重，初始化

  for (var i = 0; i < dataList.length; i++)
    checkedDataOfTopic[dataList[i].topic].add(dataList[i].created_time);

  for (var i = 0; i < topicList.length; i++)
    checkedDataOfTopic[topicList[i]] = Array.from(checkedDataOfTopic[topicList[i]]); //重新变成Array
  return checkedDataOfTopic;
}

/*
通过给定的排好序的打卡时间列表，返回到今天为止的连续打卡天数
@dateList : ["2018-06-03", "2018-06-04", "2018-06-23", "2018-07-01", "2018-07-02"]
@return 0
*/
function getSuccessiveDayByDateList(dateList){
  let todate = new Date(), year = todate.getFullYear(), month = todate.getMonth() + 1;
  var day = todate.getDate();
  var date = getFullDateSlash(year, month, day);

  let l = dateList.length - 1;

  //如果最后一个日期不是今天，则默认返回0
  if (dateList[l] != date) return 0;
  var count = 1;
  for (var i = 1; i <= l; i++){
    date = getFullDateSlash(year, month, day - i);
    if (dateList[l - i] === date) count++;
    else break;
  }
  return count;
}

// 计算successiveDay，getImageUrl，完善topic信息
// function getAndCalculateTopicInfo(dataMap, allTopic){
//   var count = 0, infoList = [];
//   for (var i in allTopic) {
//     let info = allTopic[i];
//     // 计算连续打卡天数
//     dataMap[info.name].sort(function (a, b) { return a > b ? 1 : -1; });
//     let successiveNum = getSuccessiveDayByDateList(dataMap[info.name]);
//     infoList.push({
//       'name': info.name,
//       'image_url': info.image_url,
//       'successive_day': successiveNum,
//       'total_day': dataMap[info.name].length,
//     });
//   }
//   return infoList;
// }



// 把TopicInfo按照每size一组，分组
function divideTopicInfoIntoGroups(dataMap, allTopic, size){
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
      'insist_day': info.insist_day });
    count++;
  }

  dividedList.push(tmpList);
  return dividedList;
}

/*
@param checkedList [{'topic':'减肥', 'created_time':'2018-06-23'}, {}, {}, ...]
@param givenDate '2018-07-02'
*/
function getCheckDetailOnGivenDay(checkedList, givenDate){
  var checkedTopicList = [];
  for (var i = 0; i < checkedList.length; i++){
    if (checkedList[i].created_time === givenDate)
      checkedTopicList.push(checkedList[i].topic);
  }
  return checkedTopicList;
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
 * 获取本月月初的日期
 */
function getMonthStartDate(date) {
  if (date > new Date()) date = new Date();
  let firstDateStr = date.getFullYear() + '-' + parseInt(date.getMonth() + 1);
  return new Date(firstDateStr + '-1');
}


/**
 * 获取日期标题
 */
function getCompletenessSubtitle (currentdate, timelapse, n) {
  let startdate = currentdate == null ? moment() : moment(currentdate),
      enddate = moment(startdate),
      subtitle = '';

  if (n != -1 && n != 1 && n != 0) return;

  switch (timelapse) {
    case "1周":
      if (n != 0) startdate.add(n*7, 'days');
      startdate = getWeekStartDate(startdate);
      enddate = getWeekEndDate(startdate);
      break;
    case "1个月":
      enddate = moment(enddate).add(n, 'month');
      startdate = moment(enddate).subtract(1, 'month')
      break;
    case "3个月":
      enddate = moment(enddate).add(3*n, 'month').endOf('month');
      startdate = moment(enddate).subtract(3, 'month')
      break;
    case "1年":
      if (n != 0) startdate = moment(startdate).add(n, 'year');
      startdate = startdate.startOf('year');
      enddate = moment(startdate).endOf('year');
      break;
    case "全部":
      break;
    default:
      break;
  }
  // if (startdate > moment()) return false;

  subtitle = startdate.format('YYYY.MM.DD') + ' 到 ' + enddate.format('YYYY.MM.DD');

  return {'subtitle': subtitle, 'enddate': enddate};
}


/**
 * 将24小时未打卡的卡片insist_day设置为0
 */
function filterDatedData(user_topic_list){
  for (var i in user_topic_list){
    var item = user_topic_list[i];
    if (item['insist_day'] == 0) continue; //0就不用管是否过期了
    //如果超过24小时未打卡，则显示的时候自动显示insist_day为0
    if (moment().diff(moment(item['update_time']), 'hours') > 24)
      item['insist_day'] = 0;
  }
}

/**
 * 过滤掉没变化的数据，只剩下用户修改过的数据
 */
function filterUnchangeData(user_topic_list){
  user_topic_list.pop();
  var filtered_list = [];
  for (var i in user_topic_list){
    var item = user_topic_list[i];
    // 打卡，或者取消弹框，则需要在数据库中修改
    // 用户不可能在“我的打卡”这一页开启弹窗，
    // 所以只需要判断是否为1即可，1就是没关闭
    if (!item['is_checked'] && item['if_show_log'] == 1) continue;
    filtered_list.push(item);
  }
  return filtered_list;
}



module.exports = {
  /* 功能方面 */
  login, 
  setStorageSync, 
  getStorageSync,

  /* 时间计算方面 */
  isLeap,
  getDaysOfGivenMonth,
  getFirstDayofGivenMonth,
  addZero,
  generateCalendar,
  getFullDateSlash,
  getYearMonthSlash,
  getFormateDatetimeEN,
  // getAllTopicList,
  getCheckedDataOfEveryTopic,
  // getAndCalculateTopicInfo,
  divideTopicInfoIntoGroups,
  getCheckDetailOnGivenDay,
  getWeekEndDate,
  getWeekStartDate,
  getCompletenessSubtitle,

  /* mytopic部分 */
  getSubscriptByLength, //计算下标
  filterDatedData, //过滤掉过期的数据，主要是看insist_day连续坚持天数是否正确
  filterUnchangeData, //过滤掉没变化的数据，只剩下有变化的数据
}
