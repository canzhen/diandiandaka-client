

/**
 * 用户登录，无须让用户授权，在后端保存用户的openid，
 * 名字和头像可以暂时为空，前端保存用户sessionid，
 * 每次发送post请求会在header里带一个sessionid，
 * sessionid的header这个功能直接写在api.js里了，封装在每个post请求里
 */
function login(fnSuccess) {
  const api = require('../ajax/api.js');
  wx.login({ //用户登录
    success(loginResult) {
      console.log('登录成功');
      console.log(api);
      let code = loginResult.code;
      api.postRequest({
        'url': '/user/login',
        'data': {
          'code': code,
        },
        'success': fnSuccess,
        'fail': function (res) {
          console.log('更新或添加用户登录状态失败，请检查网络状态');
        }
      });
    },
    fail(loginError) {
      console.log('微信登录失败，请检查网络状态');
    }
  })

  //查看用户是否授权
  // wx.getSetting({
  //   success: function (res) {
  //     if (res.authSetting['scope.userInfo']) {
  //       console.log('用户已经授权');
  //       if (wx.getStorageSync('username') && wx.getStorageSync('avatarurl')) return;
  //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        
  //       wx.getUserInfo({
  //         success: function (res) {
  //           /**
  //            * {'nickName': '', 
  //            * 'avatarUrl':'', 
  //            * 'country': '', 
  //            * 'province':'', 
  //            * 'city': '', 
  //            * 'gender':''}
  //            */
  //           // 其实想想，不需要全部存下来，省市这些都不展示，性别也不展示
  //           // 所以其实只要存名字和头像，甚至名字都不用，因为可以直接open-data展示
  //           // wx.setStorageSync('userInfo', res.userInfo);
  //           wx.setStorageSync('username', res.userInfo.nickName);
  //           // 先在数据库里搜索是否存在username这个字段，
  //           // 如果有，直接获取数据库里的头像url

  //           // 否则，将userinfo里的url作为头像url存下来
  //           wx.setStorageSync('avatarurl', res.userInfo.avatarUrl);
  //         },
  //       })
  //     }
  //   }
  // })
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
    'expiration time:' + expiration + ', current time is : ' + timestamp);

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
  for (let j = 1; j < getFirstDayofGivenMonth(year + '-' + month); j++) arr.push(' ');
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


/*
将时间翻译成带有中文字符‘年’‘月’
*/
function translateFormateDate(date) {
  var year = date.split('-')[0]
  var month = date.split('-')[1]
  return year + '年' + month + '月'
}


/*
获取当前时间
*/
function getCurrentDate(date) {
  // var today = new Date()
  // var year = today.getFullYear()
  // var month = today.getMonth() + 1
  // var day = today.getDate()
  // var week = today.getDay()

  // function getFullDateSlash() {
  //   return year + '-' + addZero(month) + '-' + addZero(day)
  // }

  // function getYearMonth() {
  //   return year + '-' + addZero(month)
  // }

  // return {
  //   getFullDateSlash,
  //   getYearMonth,
  // }
}

/*
给year，month和day，返回'2018-07-08'格式的string
*/
function getFullDateSlash(year, month, day) {
  if (arguments.length == 3){
    return year + '-' + addZero(month) + '-' + addZero(day)
  }else if (arguments.length == 1){
    let date = arguments[0];
    return date.getFullYear() + '-' + 
            addZero(parseInt(date.getMonth() + 1)) + '-' +
            addZero(date.getDate());
  }
}

/*
接受年月，返回下一个yyyy-mm
*/
function nextMonth(date) {
  var year = date.split('-')[0]
  var month = date.split('-')[1]
  if (parseInt(month) < 11)
    return year + '-' + addZero(parseInt(month) + 1)
  else
    return parseInt(year) + 1 + '-' + '01'
}

/* 
接受年月，返回前一个yyyy-mm
*/
function lastMonth(date) {
  var year = date.split('-')[0]
  var month = date.split('-')[1]

  if (month === '01')
    return parseInt(year) - 1 + '-' + '12'
  else
    return year + '-' + addZero(parseInt(month) - 1)
}


function getAllTopicList(dataList){
  var allTopicList = new Set(); //去重
  for (var i = 0; i < dataList.length; i++){
    allTopicList.add(dataList[i].topic);
  }
  return Array.from(allTopicList);
}


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
function getAndCalculateTopicInfo(dataMap, allTopic){
  var count = 0, infoList = [];
  for (var i in allTopic) {
    let info = allTopic[i];
    // 计算连续打卡天数
    dataMap[info.name].sort(function (a, b) { return a > b ? 1 : -1; });
    let successiveNum = getSuccessiveDayByDateList(dataMap[info.name]);
    infoList.push({
      'name': info.name,
      'image_url': info.image_url,
      'successive_day': successiveNum,
      'total_day': dataMap[info.name].length,
    });
  }
  return infoList;
}

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
      'name': info.name, 
      'image_url': info.image_url, 
      'number': count, //第n组的第number个，用于计算在总数组中的位置
      'successive_day': info.successive_day });
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

/*
根据传入的日期，获取传入日期前或者后n天之后的日期，
@date 传入的日期
@n 之后或者之前n天
返回格式 : '2018.04.03'
*/
function getDateByDiffDays(date, n) {
  var nextweekdate = new Date(date);
  nextweekdate.setDate(date.getDate() + n);
  return getFullDateDot(nextweekdate);
}

function getFullDateDot(nextweekdate){
  let formatNextWeekDate = nextweekdate.getFullYear() + '.' +
    addZero(parseInt(nextweekdate.getMonth() + 1)) + '.' +
    addZero(nextweekdate.getDate());
  return formatNextWeekDate;
} 

/*
获取本周的周一的日期
*/
function getWeekStartDate(currentdate) {
  if (currentdate > new Date()) currentdate = new Date();
  let diff = currentdate.getDay() == 0 ? 6 : currentdate.getDay() - 1 ;
  currentdate.setDate(currentdate.getDate() - diff);
  return currentdate;
}


/*
获取本周日的时间
*/
function getWeekEndDate(date) {
  if (date > new Date()) date = new Date();
  let diff = date.getDay() == 0 ? 0 : 7 - date.getDay();
  date.setDate(date.getDate() + diff);
  return new Date(date);
}


/*
获取本月月初的日期
*/
function getMonthStartDate(date) {
  if (date > new Date()) date = new Date();
  let firstDateStr = date.getFullYear() + '-' + parseInt(date.getMonth() + 1);
  return new Date(firstDateStr + '-1');
}


/*
获取本月月末的日期
*/
function getMonthEndDate(date){
  if (date > new Date()) date = new Date();
  let firstDate = new Date(getMonthStartDate(date));
  let diffDay = getDaysOfGivenMonth(firstDate.getFullYear())[firstDate.getMonth()];
  firstDate.setDate(firstDate.getDate() + diffDay - 1);
  return firstDate;
}

/*
获取从当前月往后数第三个月月末的日期
*/
function getThreeMonthEndDate(date) {
  if (date > new Date()) date = new Date();
  let year = date.getFullYear(), 
      month = date.getMonth() + 1;

  let enddate = new Date(year + '-' + month + '-1');
  enddate.setMonth(enddate.getMonth() + 3);
  return enddate;
}


/*
获取当前日期的年份开始时间
*/
function getYearStartDate(date){
  if (date > new Date()) date = new Date();
  return new Date(date.getFullYear() + '.01.01');
}

/*
获取当前日期的年份结束时间
*/
function getYearEndDate(date) {
  if (date > new Date()) date = new Date();
  return new Date(date.getFullYear() + '.12.31');
}


/*
获取日期标题
*/
function getCompletenessSubtitle (currentdate, timelapse, n) {
  let enddate = currentdate == null ? new Date() : new Date(currentdate),
      startdate = new Date(enddate),
      subtitle = '';

  if (n != -1 && n != 1 && n != 0) return;

  switch (timelapse) {
    case "1周":
      if (n == -1 || n == 1) enddate.setDate(enddate.getDate() + n*7);
      enddate = getWeekEndDate(enddate);
      startdate = getWeekStartDate(new Date(enddate));
      break;
    case "1个月":
      enddate = new Date(enddate.getFullYear() + '-' + parseInt(enddate.getMonth() + 1));
      if (n == -1 || n == 1) enddate.setMonth(enddate.getMonth() + n);
      enddate = getMonthEndDate(enddate);
      startdate = getMonthStartDate(new Date(enddate));
      break;
    case "3个月": 
      enddate = new Date(enddate.getFullYear() + '-' + parseInt(enddate.getMonth() + 1));
      if (n == 0) enddate = getThreeMonthEndDate(enddate);
      else enddate.setMonth(enddate.getMonth() + n * 3);
      startdate.setYear(enddate.getFullYear());
      startdate.setMonth(enddate.getMonth() - 3);
      startdate.setDate(enddate.getDate());
      break;
    case "1年":
      if (n == -1 || n == 1) enddate.setYear(enddate.getFullYear() + n);
      enddate = getYearEndDate(enddate);
      startdate = getYearStartDate(enddate);
      break;
    case "全部":
      break;
    default:
      break;
  }
  subtitle = getFullDateDot(startdate) + ' 到 ' + getFullDateDot(enddate);

  return {'subtitle': subtitle, 'enddate': enddate};
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
  translateFormateDate,
  getCurrentDate,
  nextMonth,
  lastMonth,
  getAllTopicList,
  getCheckedDataOfEveryTopic,
  getAndCalculateTopicInfo,
  divideTopicInfoIntoGroups,
  getCheckDetailOnGivenDay,
  getDateByDiffDays,
  getWeekEndDate,
  getWeekStartDate,
  getMonthStartDate,
  getMonthEndDate,
  getThreeMonthEndDate,
  getYearStartDate,
  getYearEndDate,
  getFullDateDot,
  getCompletenessSubtitle,
}
