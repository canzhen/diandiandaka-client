const express = require('express');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const config = require('../config.js');
const router = express.Router();


/**
 * 返回所有的topic卡片头像
 */
router.post('/getAll', function (req, res) {
  dbhelper.getAllTopicUrl((status, result_list) => {
    if (!status){
      res.send({'error_code': 100, 'msg': '', 'result_list':''});
      return;
    }
    for (var i in result_list){
      result_list[i] = config.qiniu.prefix + result_list[i]['url'];
    }
    res.send({ 'error_code': 200, 'msg': '', 'result_list': result_list});
  });
});



/**
 * 添加一个新的图标url
 */
router.post('/insert', function (req, res) {
  let topic_url = req.body.url;
  dbhelper.insertTopicUrl(topic_url, (status) => {
    if (!status) {
      res.send({ 'error_code': 100, 'msg': ''});
      return;
    }
    res.send({ 'error_code': 200, 'msg': ''});
  });
});

module.exports = router;
