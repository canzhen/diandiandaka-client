const api = require('../../ajax/api.js');

/* 获取当前用户具体打卡信息 */
function getCheckedDataList(cb){
  api.postRequest({
    'url': '/topicCheck/getAll',
    'data': {},
    'success': (res) => {
      if (res){
        cb(res.result_list);
      }else{
        cb(false);
      }
    },
    'fail': (res) => {
      console.log('从数据库中获取用户具体每日打卡信息失败');
      cb(false);
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
      if (res.error_code == 200) {
        cb(res.result_list);
      } else {
        cb(false);
        console.log('获取用户打卡信息失败');
      }
    },
    'fail': (res) => { //失败
      cb(false);
      console.log('获取用户打卡信息失败');
    }
  });

}



function getCheckedDataOfEveryTopic(dataList, topicList) {
  var checkedDataOfTopic = new Map();
  for (var i = 0; i < topicList.length; i++)
    checkedDataOfTopic[topicList[i]] = new Set(); //去重，初始化

  for (var i = 0; i < dataList.length; i++)
    checkedDataOfTopic[dataList[i].topic_name]
      .add(dataList[i].check_time);

  for (var i = 0; i < topicList.length; i++)
    checkedDataOfTopic[topicList[i]] = Array.from(checkedDataOfTopic[topicList[i]]); //重新变成Array

  return checkedDataOfTopic;
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
  console.log(checkedList);
  console.log(givenDate);
  var checkedTopicList = [];
  for (var i = 0; i < checkedList.length; i++) {
    if (checkedList[i].check_time === givenDate)
      checkedTopicList.push(checkedList[i].topic_name);
  }
  return checkedTopicList;
}


module.exports = {
  getCheckedDataList,
  getTopicInfoList,
  getCheckedDataOfEveryTopic,
  divideTopicInfoIntoGroups,
  getCheckDetailOnGivenDay,
}
