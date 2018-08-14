const express = require('express');
const config = require('../config.js');
const utils = require('../helpers/utils.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const router = express.Router();



/**
 * 保存获取到的用户的formid
 */
router.post('/saveSettings', function (req, res) {
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    let topic_name_list = req.body.topic_name_list;
    let form_id = req.body.form_id + ',';
    dbhelper.update('user_message', 'topic_name_list=?, form_id_list=CONCAT(form_id_list, ?)', 'user_id=?', [topic_name_list, form_id, openid],
      (status, result) => {
        if (status) res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': result });
      });
  });
});



module.exports = router;
