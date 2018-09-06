// pages/share/share.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.getImageInfo({
    //   src: path,
    //   success: (res) => {
    //     console.log(res);
    //   },
    //   fail: (res) => {
    //     console.log('error:'+res.errMsg);
    //   }
    // })


    let path = '/images/background1.jpg';
    //设置scroll-view高度，自适应屏幕
    wx.getSystemInfo({
      success: function (res) {
        let context = wx.createCanvasContext('shareCanvas');
        // context.stroke();
        context.drawImage(path, 0, 0, 
            res.windowWidth, res.windowHeight - 50);
        context.draw();
      }
    });


    // wx.downloadFile({
    //   url: 'https://pcjzq4ixp.bkt.clouddn.com/share/background1.jpg',
    //   success: function (sres) {
    //     console.log('download file success');
    //     console.log(sres);
    //     // that.data.mysrc = sres.tempFilePath
    //   }, fail: function (fres) {
    //     console.log('download file fail');
    //     console.log(fres.errMsg);
    //   }
    // })


  },


  // drawImage: function(){
  //   let mycv = document.getElementById('shareCanvas');
  //   let myctx = mycv.getContext()
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})