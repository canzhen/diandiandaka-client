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
  return temp_topic_data_num;
}

/**
 * 从数据库中获取，显示到前台的时候的过滤函数
 * 1. 将24小时未打卡的卡片insist_day设置为0，
 * 2. 将过期的卡片删除（当前日期大于用户设置的end_date）
 * 3. 今日打过卡的，直接is_checked设置为true
 */
function filterDatedData(user_topic_list){
  let currentMoment = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  var filteredList = [];
  for (var i in user_topic_list) {
    var item = user_topic_list[i];
    // 将过期的卡片删除（当前日期大于用户设置的end_date）
    if (currentMoment > moment(item['end_date'], 'YYYY-MM-DD')) continue;
    //如果超过2天未打卡，则显示的时候自动显示insist_day为0
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
function filterUnchangeData(user_topic_list){
  user_topic_list.pop();
  var filtered_list = [];
  for (var i in user_topic_list){
    var item = user_topic_list[i];
    if (!item['data_changed']) continue;
    if (item['log'] == undefined) item['log'] = '';
    filtered_list.push(item);
  }
  return filtered_list;
}



module.exports = {
  /* 功能方面 */
  login, 
  setStorageSync, 
  getStorageSync,


  /* 我的打卡mytopic 部分 */
  getSubscriptByLength, //计算下标
  filterDatedData, //过滤掉过期的数据，主要是看insist_day连续坚持天数是否正确
  filterUnchangeData, //过滤掉没变化的数据，只剩下有变化的数据
}
