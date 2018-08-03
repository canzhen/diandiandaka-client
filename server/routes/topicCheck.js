const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();


/**
 * 获取topic表的所有数据
 */
router.post('/getAll', function (req, res) {
  dbhelper.getTopic(req.body.limit_num, (status, result_list) => {
    for (var i in result_list) {
      result_list[i]['topic_url'] = config.qiniu.prefix + result_list[i]['topic_url'];
    }
    let error_code = status ? 200 : 100;
    res.send({
      'error_code': error_code,
      'data': result_list
    });
  });
});

module.exports = router;