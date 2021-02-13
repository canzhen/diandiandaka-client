const root = 'https://zhoucanzhendevelop.com';
const utils = require('../vendor/utils.js');
var sessionId = null;

// 接口信息
const API = {
  ACCOUNT: {
    // 登录
  }
};

/**
 * POST请求接口
 * @param params: {'url':'', 
 *                 'data':{}, 
 *                 'success': function(){}, 
 *                 'fail': function(){},
 *                 'showLoading': false, 
 *                 'header' : {}}
 */
function postRequest(params) {
  sessionId = utils.getStorageSync('sessionId');

  if (params.showLoading){
    wx.showLoading({
      title: '加载中',
    })
  }
  wx.getNetworkType({
    success: (res) => {
      if (res.networkType == 'none') {
        wx.showToast({
          title: '无网络访问',
          icon: 'none',
          duration: 5000
        })
        return
      }
      //添加header
      if (!params.header) params.header = {};
      params.header['content-type'] = 'application/json';
      params.header['session-id'] = sessionId;
      wx.request({
        url: root + params.url,
        method: 'POST',
        dataType: 'json',
        header: params.header, 
        data: params.data,
        success: (res) => {
          if (params.showLoading) wx.hideLoading()
          if (res.data.state == -2) {
            wx.showToast({
              title: '请重新登录',
              icon: 'none',
              duration: 5000
            })
            wx.reLaunch({
              url: '../index/index'
            })
            return
          }
          if (res.statusCode == 200)
            params.success(res.data)
          else showFailToast()
        },
        fail: (res) => {
          console.log('post failed:');
          console.log(res);
          if (params.showLoading) wx.hideLoading();
          showFailToast()
          params.fail(res.data)
          return
        }
      })
    }
  })
}


/**
 * GET 请求接口
 */
function getRequest(url, data, fnSucess, fnFail, showLoading = false) {
  if (showLoading) {
    wx.showLoading({
      title: '加载中',
    })
  }
  wx.getNetworkType({
    success: (res) => {
      //console.log(res.networkType);
      if (res.networkType == 'none') {
        // console.log('1111')
        wx.showToast({
          title: '无网络访问',
          icon: 'none',
          duration: 5000
        })
        return
      }
      wx.request({
        url: root + url,
        method: 'GET',
        data: data,
        dataType: 'json',
        header: { 'content-type': 'application/json;chareset=UT8-8' },
        success: (res) => {
          if (showLoading) wx.hideLoading();
          if (res.statusCode == 200) {
            if (fnSucess && typeof fnSucess == "function") {
              fnSucess(res.data);
            }
          } else {
            showFailToast()
            fnFail(res);
          }
        },
        fail: (res) => {
          if (showLoading) wx.hideLoading();
          showFailToast()
          if (fnFail && typeof fnFail == "function")
            fnFail(res);
        }
      })
    }
  })
}


/**
 * 显示提交失败的toast
 */
function showFailToast() {
  wx.showToast({
    title: '加载失败..大爷饶命，小的这就去查看原因..',
    icon: 'none',
    duration: 2000
  })
}



function checkAsyc() {
  wx.reLaunch({
    url: '../index/index'
  })
}


module.exports = {
  root,
  API,
  postRequest,
  getRequest
}