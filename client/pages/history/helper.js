const moment = require('../../vendor/moment.js');

/**
 * 给year，month和day，返回'2018-07-08'格式的string
 */
function getFullDateSlash(year, month, day) {
  return moment().format("YYYY-MM-DD");
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


function checkIfAllZero(list){
  for (let i = 0; i < list.length; i++){
    if (list[i]) return false;
  }
  return true;
}

module.exports = {
  getFullDateSlash,
  checkIfAllZero,
}
