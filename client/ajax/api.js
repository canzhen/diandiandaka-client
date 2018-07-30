const root = getApp().config.request_head;

// 接口信息
const API = {
  ACCOUNT: {
    // 登录
  }
};

/**
 * POST请求接口
 */
function postRequest(params) {
  wx.showLoading({
    title: '加载中',
  })
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
        url: params.url,
        method: 'POST',
        dataType: 'json',
        data: params.data,
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: (res) => {
          wx.hideLoading()

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
        },
        fail: (res) => {
          wx.hideLoading();
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
function getRequest(url, data, fnSucess, fnFail) {
  wx.showLoading({
    title: '加载中',
  })
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
          wx.hideLoading();
          if (res.statusCode == 200 && res.data.errorCode == 200) {
            if (fnSucess && typeof fnSucess == "function") {
              fnSucess(res.data);
            }
          } else {
            //统一代码处理中心
            // console.log("------------- ")
          }

        },
        fail: (res) => {
          wx.hideLoading();
          showFailToast()
          //统一代码处理中心
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
    title: '提交失败..大爷饶命，小的这就去查看原因..',
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