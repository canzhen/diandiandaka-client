// const utils = require('../../vendor/utils.js');

/**
 * 跳转页面到新卡片界面
 */
function navigateToNewTopicPage(topicname, topicurl = ''){
  wx.navigateTo({
      url: '/pages/newtopic/newtopic?topic_name=' + topicname +
        '&topic_url=' + topicurl
    })
}

module.exports = {
  navigateToNewTopicPage,
}