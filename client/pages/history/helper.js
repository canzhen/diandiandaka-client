const moment = require('../../vendor/moment.min.js');
const weekList = ['一', '二', '三', '四', '五', '六', '七'];
const yearList = ['1月', '2月', '3月', '4月', '5月', '6月', '7月',
                  '8月', '9月', '10月', '11月', '12月'];


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
  判断闰年还是平年
*/
function isLeap(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0 ? true : false;
}

/**
 * 获取某年某月的第一天是星期几
 */
function getFirstDayofGivenMonth(date) {
  let day = new Date(date + '-1').getDay();
  return day == 0 ? 7 : day;
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
 * 获取每个月的天数数组
 * @param checkedDataList 该月份被checked的天数 ['2018-04-23', '2018-05-30', ...]
 * @param year 要生成的年份
 * @param month 要生成的月份
 * @param color 当前月份的‘年月小圆圈’要显示的颜色 #f8d2e9
 */
function generateCalendar(checkedDataList, year, month, color) {
  var arr = [];
  // 根据某年某月的第一天是星期几来填充空值
  for (let j = 1; j < getFirstDayofGivenMonth(year + '-' + month); j++)
    arr.push(' ');
  // 根据当前月有多少天，循环把日期放入数组
  for (let i = 0; i < getDaysOfGivenMonth(year)[month - 1]; i++) {
    let value = year + '-' + addZero(month) + '-' + addZero(i + 1);
    let day = addZero(i + 1);
    var checked = false;
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
  return moment().format('YYYY.MM.DD HH:mm');
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
function getYearMonthSlash(date) {
  return moment(date).format('YYYY-MM');
}

/*
通过给定的排好序的打卡时间列表，返回到今天为止的连续打卡天数
@dateList : ["2018-06-03", "2018-06-04", "2018-06-23", "2018-07-01", "2018-07-02"]
@return 0
*/
function getSuccessiveDayByDateList(dateList) {
  let todate = new Date(), year = todate.getFullYear(), month = todate.getMonth() + 1;
  var day = todate.getDate();
  var date = getFullDateSlash(year, month, day);

  let l = dateList.length - 1;

  //如果最后一个日期不是今天，则默认返回0
  if (dateList[l] != date) return 0;
  var count = 1;
  for (var i = 1; i <= l; i++) {
    date = getFullDateSlash(year, month, day - i);
    if (dateList[l - i] === date) count++;
    else break;
  }
  return count;
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
 * 获取图标的横坐标文字（周、月、三个月等，都不同）
 */
function getCanvasXText(timelapse, enddate){
  enddate = moment(enddate);
  switch (timelapse){
    case '1周':
      return weekList;
    case '1个月':
      let daysList = getDaysListOfGivenMonth(
        enddate.year(), enddate.month() + 1);
      return daysList;
    case '1年':
      return yearList;
    case '全部': break;
    default: break;
  }
}

function checkIfAllZero(list){
  console.log('check if all zero');
  for (let i = 0; i < list.length; i++){
    if (list[i]) return false;
  }
  return true;
}

module.exports = {
  isLeap,
  getFirstDayofGivenMonth,
  addZero,
  generateCalendar,
  getFullDateSlash,
  getYearMonthSlash,
  getFormateDatetimeEN,
  getDaysOfGivenMonth,
  getDaysListOfGivenMonth,
  getCanvasXText,
  checkIfAllZero,
}
