const moment = require('./moment.js');
const api = require('../ajax/api.js');

const perseveranceList = [
  '“坚持不懈才能积沙成塔”',
  '“人生在勤，不索何获”',
  '“业精于勤而荒于嬉”',
  '“不经一番寒彻骨，怎得梅花扑鼻香”',
  '“契而不舍，金石可偻”',
  '“绳锯木断，水滴石穿”',
  '“九层之台，起于垒土”', ,
  '“苟有恒，何必三更起五更眠”',
  '“及时当勉励，岁月不待人”'];


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
          module.exports.setStorageSync(
                'sessionId', res.sessionId, 
                1000 * 60 * 60 * 2); //服务端的session也是默认2小时过期
          cb(res.error_code, res.msg);
        }, 'fail': (res) => {
          console.log('从数据库中更新或添加用户登录状态失败，请检查网络状态');
          cb(100, '');
        }
      });
    }, fail(loginError) {
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
    ', expiration time:' + expiration + 
    ', value is : ' + data + 
    ', current time is : ' + timestamp);

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
module.exports.filterDataFromDB = function (user_topic_list){
  let currentMoment = moment();
  let filteredList = [];
  let datedList = [];


  for (let i in user_topic_list) {
    let item = user_topic_list[i];
    // 如果超过2天未打卡，则显示的时候自动显示insist_day为0
    let lastupdateMoment = moment(item['last_check_time'], 'YYYY-MM-DD');
    if (moment().diff(lastupdateMoment, 'days') >= 2)
      item['insist_day'] = 0;
    // 今日打过卡的，直接is_checked设置为true
    if (lastupdateMoment.format('MM-DD') == 
          moment().format('MM-DD'))
      item['is_checked'] = true;

    // 将过期的卡片标注为过期（当前日期大于用户设置的end_date）
    if (currentMoment.diff(
      moment(item['end_date']).format('YYYY-MM-DD'), 'days') > 0) {
      item['dated'] = true;
      datedList.push(item);
    } else {
      item['dated'] = false;
      filteredList.push(item);
    }
  }


  // 把过期的卡片放在最后面
  for (let i in datedList)
    filteredList.push(datedList[i]);

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
    if (topic_list[i].is_deleted)
      uncheck_topic_list.push(topic_list[i]);
    if (topic_list[i].is_checked){
      if (topic_list[i].count == undefined) topic_list[i].count = -1;
      checked_topic_list.push(topic_list[i]);
    }
  }

  /* 第一步，处理checked topic，需要更新user_topic，并往topic_list里新增数据*/
  //整理数据成[['topic_name1','insist_day1',...., 'topic_name1', 'total_day1',...,'topic_name1', 'if_show_log1',..]

  // 生成user_topic表update list
  let user_topic_update_list = [];
  console.log(checked_topic_list)
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


  let user_topic_update_column_map = {
    insist_day: {
      condition_column: 'topic_name',
      condition_num: checked_topic_list.length,
    },
    total_day: {
      condition_column: 'topic_name',
      condition_num: checked_topic_list.length,
    },
    if_show_log: {
      condition_column: 'topic_name',
      condition_num: checked_topic_list.length,
    },
    last_check_time: {
      condition_column: 'topic_name',
      condition_num: checked_topic_list.length,
    }
  };


  // 生成topic_check表update list
  let user_topic_insert_list = [];
  for (let i in checked_topic_list) {
    var tmp_list = [];
    tmp_list.push("'" + checked_topic_list[i]['topic_name'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['last_check_time'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['last_check_timestamp'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['log'] + "'");
    tmp_list.push("'" + checked_topic_list[i]['count'] + "'");
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
          user_topic_update_reduce_list,
          user_topic_update_list, user_topic_update_column_map,
          user_topic_insert_list];
}

/**
 * 参数为随机数的最小值和最大值
 * 范围：[min, max] 都是闭集
 */
module.exports.getRandom = function (min, max){
  return getRandom(min, max);
}

function getRandom (min, max){
  // var seed = today.getTime();
  // seed = (seed * 9301 + 49297) % 233280;
  var Range = max - min;
  var Rand = Math.random();
  return (min + Math.round(Rand * Range));
}


function checkNumber(theObj) {
  var reg = /^[0-9]+.?[0-9]*$/;
  if (reg.test(theObj)) {
    return true;
  }
  return false;
}



module.exports.isPhoneNumberLegal = function(phoneNumber){
  phoneNumber = phoneNumber+''; //变成string
  if (phoneNumber.length < 5) return false; //小于5位的手机号不存在吧？
  if (!checkNumber(phoneNumber)) return false; //验证字符串是否是纯数字
  
  return true;
}





/**
 * 绘制分享图
 */
module.exports.drawShareImage = function (canvasId, backgroundUrl,
  userName, avatarUrl, topicName, insistDay, higherRate,
  top_height, width, height, cb) {
  
  insistDay = insistDay + '';
  let ctx = wx.createCanvasContext(canvasId);
  ctx.drawImage(backgroundUrl, 0, 0, width, height);


  // 绘制时间
  // ctx.setFontSize(12);
  ctx.font = 'bold 12px 微软雅黑';
  ctx.setFillStyle('black');
  ctx.setTextAlign('center');
  let yijingWidth = ctx.measureText('已经').width + 5;
  let tianWidth = ctx.measureText('天').width;
  // console.log('已经的width：' + yijingWidth);
  // console.log('天的width：' + tianWidth);
  // const metrics = ctx.measureText(time).width;   //时间文字的所占宽度
  ctx.fillText('我在点点小打卡坚持', width / 2, top_height);
  ctx.setFontSize(30);
  let topicNameWidth = ctx.measureText(topicName).width;
  let insistDayWidth = ctx.measureText(insistDay).width + 10;
  // console.log('卡片名称的width：' + topicNameWidth);
  // console.log('坚持天数的width：' + insistDayWidth);
  
  let totalWidth = topicNameWidth + yijingWidth + 
      insistDayWidth + tianWidth;
  let topicNamePos = (width - totalWidth + topicNameWidth) / 2;
  // console.log(topicNamePos);
  ctx.fillText(topicName, topicNamePos, top_height + 39);
  ctx.setFontSize(12);
  let yijingPos = topicNamePos + (topicNameWidth + yijingWidth) / 2;
  // console.log(yijingPos);
  ctx.fillText('已经', yijingPos, top_height + 38);
  ctx.setFontSize(30); 
  insistDayWidth = ctx.measureText(insistDay).width;
  // console.log('坚持天数：' + insistDay);
  // console.log('坚持天数的width：' + insistDayWidth);
  let insistDayPos = yijingPos + (yijingWidth + insistDayWidth) / 2;
  // console.log(insistDayPos);
  ctx.fillText(insistDay, insistDayPos, top_height + 40);
  ctx.setFontSize(12);
  let tianPos = insistDayPos + (insistDayWidth + tianWidth) / 2;
  // console.log(tianPos);
  ctx.fillText('天', tianPos, top_height + 38);


  ctx.font = 'normal normal 14px sans-serif';
  ctx.setTextAlign('center');
  ctx.setFillStyle('black');

  if (higherRate >= 60){
    ctx.fillText('超过了' + higherRate + '%用户', width / 2, top_height + 70);
  } else {
    ctx.setFontSize(10);
    let idx = getRandom(0, perseveranceList.length - 1);
    // idx = 1;
    let encouragePhrase = perseveranceList[idx];
    // encouragePhrase = '“不经一番寒彻骨，怎得梅花扑鼻香”';
    ctx.fillText(encouragePhrase, width/2, top_height + 70);
  }

  // let time = moment().format('YYYY年MM月DD日');
  // ctx.setFontSize(10);
  // ctx.fillText(time, width / 2, top_height + 90);


  // let avatarHeight = higherRate >= 60 ? top_height + 90 : top_height + 110;
  let avatarHeight = top_height + 90;
  console.log('avatarUrl: ' + avatarUrl);
  if (!avatarUrl) {
    /** 只有用户名 */
    ctx.font = 'normal normal 14px sans-serif';
    ctx.setTextAlign('center');
    ctx.setFillStyle('#333333');
    ctx.fillText(userName, width / 2, avatarHeight + 15);
  }else{
    /** 头像和用户名 */
    ctx.save();
    ctx.arc(width / 2 - 30, avatarHeight + 20, 20, 0, 2 * Math.PI);
    ctx.clip()
    ctx.drawImage(avatarUrl, width / 2 - 50, avatarHeight, 40, 40);
    ctx.restore();

    ctx.font = 'normal normal 14px sans-serif';
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333333');
    ctx.fillText(userName, width / 2, avatarHeight + 25);
  }


  ctx.draw();
  console.log('done drawing..')
  cb();
}






/**
 * 保存画布到本地图片
 */
module.exports.canvasToFile = function (canvasId, width, height, cb) {
  wx.canvasToTempFilePath({
    canvasId: canvasId,
    width: width,
    height: height,
    destWidth: width * 4,
    destHeight: height * 4,
    quality: 1,
    success: (res) => {
      console.log(res.tempFilePath);
      cb(res.tempFilePath)
    },
    fail: function (res) {
      console.log(res)
    }
  })
}






// module.exports = {
//   /* 功能方面 */
//   getRandom, //产生随机数


//   /* 我的打卡mytopic 部分 */
//   getSubscriptByLength, //计算下标
//   filterDataFromDB, //过滤掉过期的数据，主要是看insist_day连续坚持天数是否正确
//   filterUnchangeData, //过滤掉没变化的数据，只剩下有变化的数据
//   formatCheckData,
//   updateFormId, //存入formid到user表里，以供推送消息时使用
// }