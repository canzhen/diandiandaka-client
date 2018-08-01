const express = require('express');
const dbhelper = require('../helpers/dbhelper.js');
const router = express.Router();


/**
 * 通过用户id在数据库中获取该用户的卡片列表
 */
router.post('/getTopicListByUserId', function (req, res) {
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.updateUser('avatar_url', url, openid, (status, result) => {
      if (status) res.send({ 'error_code': 200, 'msg': '' });
      else res.send({ 'error_code': 100, 'msg': result });
    })
  });

});

module.exports = router;
