const moment = require('../../vendor/moment.min.js');




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
  for (let i = 0; i < list.length; i++){
    if (list[i]) return false;
  }
  return true;
}

module.exports = {
  getFullDateSlash,
  getYearMonthSlash,
  getFormateDatetimeEN,
  getCanvasXText,
  checkIfAllZero,
}
