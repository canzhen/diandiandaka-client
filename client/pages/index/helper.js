/**
 * 登录用户，并将用户数据加入到数据库中，
 * 如果用户信息在数据库已经存在，则更新
 */
function userLogin(userinfo) {
  if (userinfo == []) return false;
  wx.login({
    success(loginResult) {
      console.log('登录成功');
      wx.request({
        url: getApp().config.request_head + '/users/login',
        method: 'POST',
        data: {
          'code': loginResult.code,
          'userinfo': userinfo
        },
        success: function (res) {
          console.log('发送请求成功啦！' + res.data);
          return true;
        }
      })
    },
    fail(loginError) {
      console.log('微信登录失败，请检查网络状态');
      return false;
    }
  })
}

/**
 * 查看指定卡片是否已存在，
 * 如果存在则调用existCb回调函数，
 * 如果不存在则调用notExistCb回调函数
 */
function checkTopic(topicname, existCb, notExistCb) {
  wx.request({
    url: getApp().config.request_head + '/db/checktopic',
    method: 'POST',
    data: { 'topicname': topicname },
    success: function (res) { //请求成功之后的回调函数
      /* 如果存在，则在该卡片的记录的打卡人数上加一，跳转到用户的所有打卡界面 */
      if (res.statusCode == 200 && res.data.ifExist) {
        console.log('topic已存在');
        existCb();
      } else { /* 如果不存在，则需要往卡片表里新增，跳转到新卡片界面 */
        console.log('topic不存在');
        notExistCb();
      }
    }
  })
}


/**
 * 更新卡片表，在对应的卡片记录上的打卡人数上加一
 */
function updateTopic(topicname){
  console.log('现在开始update该topic的打卡人数');
  wx.request({
    url: getApp().config.request_head + '/db/updatetopic',
    method: 'POST',
    data: { 'topicname': topicname },
    success: function (res) {
      if (res.statusCode == 200 && res.data.status) console.log('新增人数成功');
      else console.log('新增人数失败');
    }
  })
}



/**
 * 往topic表里新增一条新的数据
 */
function insertTopic(topicname, topicurl, cb) {
  console.log('现在开始往topic表里新增一条新topic');
  wx.request({
    url: getApp().config.request_head + '/db/inserttopic',
    method: 'POST',
    data: { 'topicname': topicname,
            'topicurl': topicurl},
    success: function (res) {
      if (res.statusCode == 200 && res.data.status) console.log('新增' + topicname + '人数成功');
      else console.log('新增' + topicname + '人数失败');
      cb (res.data.status);
    }
  })
}



/**
 * 获取topic表的所有数据
 */
function getTopic(limit_num = -1, cb) {
  console.log('现在开始往topic表里新增一条新topic');
  wx.request({
    url: getApp().config.request_head + '/db/gettopic',
    method: 'GET',
    data: {
      'limit_num': limit_num
    },
    success: function (res) {
      cb(res['data']['status'], res['data']['data']);
    }
  })
}

module.exports = {
  userLogin,
  checkTopic,
  updateTopic,
  insertTopic,
  getTopic,
}