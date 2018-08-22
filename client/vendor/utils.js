const moment = require('./moment.js');
const api = require('../ajax/api.js');

function getTimezone(){
  return -parseInt(new Date().getTimezoneOffset());
}

/**
 * 用户登录，无须让用户授权，在后端保存用户的openid，
 * 名字和头像可以暂时为空，前端保存用户sessionid，
 * 每次发送post请求会在header里带一个sessionid，
 * sessionid的header这个功能直接写在api.js里了，封装在每个post请求里
 */
module.exports.login = function(cb) {
  wx.login({ //用户登录
    success(loginResult) {
      console.log('登录成功');
      let code = loginResult.code;
      api.postRequest({
        'url': '/login',
        'data': {
          'code': code,
          'timezone': getTimezone()
        },
        'success': (res) => {
          module.exports.setStorageSync('sessionId', res.sessionId, 1000 * 60 * 60 * 2); //服务端的session也是默认2小时过期
          cb(res.error_code, res.msg);
        },
        'fail': (res) => {
          console.log('从数据库中更新或添加用户登录状态失败，请检查网络状态');
          cb(100, '');
        }
      });
    },
    fail(loginError) {
      console.log('微信登录失败，请检查网络状态');
      cb(100, '');
    }
  })
}


/**
 * 批量保存搜集而来的formId
 */
module.exports.saveFormId = function (formIdList){
  api.postRequest({
    'url': '/saveFormId',
    'data':{
      form_id_list: formIdList
    },
    'success': (res) => {
      if (res.error_code != 200) console.log('update form_id 失败')
      else console.log('update form_id 成功')
    },
    'fail': (res) => {
      console.log('update form_id 失败')
    }
  });
}



/**
 * 设置缓存
 * @param key: 键
 * @param value: 值
 * @param expiration: 过期时间，单位为毫秒
 * @param cb: 回调函数
 * @param return: true/false
 */
module.exports.setStorageSync =  function (key, data, expiration){
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
module.exports.getStorageSync = function (key) {
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
module.exports.getSubscriptByLength = function (l, numEachRow){
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
    // if (r1 == r) {
    //   for (var c1 = 0; c1 < c; c1++)
    //     temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    // } else {
      for (var c1 = 0; c1 < numEachRow; c1++)
        temp_topic_data_num[r1][c1] = r1 * numEachRow + c1;
    // }
  }
  
  return temp_topic_data_num;
}

/**
 * 从数据库中获取，显示到前台的时候的过滤函数
 * 1. 将如果超过2天未打卡的卡片insist_day设置为0，
 * 2. 将过期的卡片标注为过期（当前日期大于用户设置的end_date）
 * 3. 今日打过卡的，直接is_checked设置为true
 */
module.exports.filterDatedData = function (user_topic_list){
  let currentMoment = moment();
  var filteredList = [];
  for (var i in user_topic_list) {
    var item = user_topic_list[i];
    // 将过期的卡片标注为过期（当前日期大于用户设置的end_date）
    if (currentMoment.diff(
        moment(item['end_date'], 'YYYY-MM-DD'), 'days') > 0){
          item['dated'] = true;
    };
    // 如果超过2天未打卡，则显示的时候自动显示insist_day为0
    let lastupdateMoment = moment(item['last_check_time'], 'YYYY-MM-DD');
    if (moment().diff(lastupdateMoment, 'days') >= 2)
      item['insist_day'] = 0;
    // 今日打过卡的，直接is_checked设置为true
    if (lastupdateMoment.format('MM-DD') == 
          moment().format('MM-DD'))
      item['is_checked'] = true;
    filteredList.push(item);
  }
  return filteredList;
}


/**
 * 要发送到数据库打卡前的过滤函数
 * 过滤掉没变化的数据，只剩下用户修改过的数据
 */
module.exports.filterUnchangeData = function (user_topic_list){
  user_topic_list.pop(); //pop掉"添加卡片"
  var filtered_list = [];
  for (var i in user_topic_list){
    var item = user_topic_list[i];
    if (!item['data_changed']) continue;
    if (item['log'] == undefined) item['log'] = '';
    filtered_list.push(item);
  }
  return filtered_list;
}


/**
 * 把checklist整理成后端update数据库时需要的格式并返回
 * 
 */
module.exports.formatCheckData = function (topic_list){
  let checked_topic_list = [],
      uncheck_topic_list = [];
  for (let i in topic_list){
    if (topic_list[i].is_checked)
      checked_topic_list.push(topic_list[i]);
    else
      uncheck_topic_list.push(topic_list[i]);
  }

  /* 第一步，处理checked topic，需要更新user_topic，并往topic_list里新增数据*/
  //整理数据成[['topic_name1','insist_day1',...., 'topic_name1', 'total_day1',...,'topic_name1', 'if_show_log1',..]

  // 生成user_topic表update list
  let user_topic_update_list = [];
  // push insist_day
  for (let i in checked_topic_list) {
    user_topic_update_list.push(checked_topic_list[i]['topic_name']);
    user_topic_update_list.push(checked_topic_list[i]['insist_day']);
  }
  // push total_day
  for (let i in checked_topic_list) {
    user_topic_update_list.push(checked_topic_list[i]['topic_name']);
    user_topic_update_list.push(checked_topic_list[i]['total_day']);
  }
  // push if_show_log
  for (let i in checked_topic_list) {
    user_topic_update_list.push(checked_topic_list[i]['topic_name']);
    user_topic_update_list.push(checked_topic_list[i]['if_show_log']);
  }
  // push last_check_time
  for (let i in checked_topic_list) {
    user_topic_update_list.push(checked_topic_list[i]['topic_name']);
    user_topic_update_list.push(checked_topic_list[i]['last_check_time']);
  }


  // 生成topic_check表update list
  let user_topic_insert_list = [];
  for (let i in checked_topic_list) {
    var tmp_list = [];
    tmp_list.push("'" + checked_topic_list[i]['topic_name'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['last_check_time'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['last_check_timestamp'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['log'] + "'");
    user_topic_insert_list.push(tmp_list);
  }


  /* 第二步，处理uncheck topic：需要在topic_check里删除数据 */
  // 默认把[当天]的所有打卡数据都删掉
  let user_topic_update_reduce_list = [];
  for (let i in uncheck_topic_list) {
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['topic_name']);
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['insist_day']);
  }
  for (let i in uncheck_topic_list) {
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['topic_name']);
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['total_day']);
  }

  for (let i in uncheck_topic_list) {
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['topic_name']);
    user_topic_update_reduce_list.push(uncheck_topic_list[i]['topic_name']);
  }


  let topic_check_delete_str = 'user_id=? AND ((topic_name=? AND check_time=?)';
  for (let i = 1; i < uncheck_topic_list.length; i++)
    topic_check_delete_str += 'OR (topic_name=? AND check_time=?)';
  topic_check_delete_str += ')'
  let topic_check_delete_list = [];
  for (let i in uncheck_topic_list) {
    topic_check_delete_list.push(uncheck_topic_list[i]['topic_name']);
    topic_check_delete_list.push(uncheck_topic_list[i]['last_check_time']);
  }


  return [topic_check_delete_str, topic_check_delete_list, 
          user_topic_update_reduce_list, user_topic_update_list,
          user_topic_insert_list];
}

/**
 * 参数为随机数的最小值和最大值
 */
module.exports.getRandom = function (min, max){
  // var seed = today.getTime();
  // seed = (seed * 9301 + 49297) % 233280;
  var Range = max - min;
  var Rand = Math.random();
  return (min + Math.round(Rand * Range));
}



// module.exports = {
//   /* 功能方面 */
//   getRandom, //产生随机数


//   /* 我的打卡mytopic 部分 */
//   getSubscriptByLength, //计算下标
//   filterDatedData, //过滤掉过期的数据，主要是看insist_day连续坚持天数是否正确
//   filterUnchangeData, //过滤掉没变化的数据，只剩下有变化的数据
//   formatCheckData,
//   updateFormId, //存入formid到user表里，以供推送消息时使用
// }
