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

    //1. 保存用户信息到user表
    let user_name = req.body.user_name,
        province = req.body.province,
        city = req.body.city,
        county = req.body.county,
        gender = req.body.gender;
        
    dbhelper.update('user', 
    'user_name=?, province=?, city=?, county=?, gender=?', 
    'user_id=?', 
      [user_name, province, city, county, gender, openid],
      (status, result) => {
        if (!status){
          res.send({ 'error_code': 100, 'msg': result });
          return;
        }
        updateUserMessage();
      });


    //2. 保存用户要通知的topic和form_id到user_message表
    let updateUserMessage = function(){
      let topic_list = req.body.topic_list,
          remind_time = req.body.remind_time,
          form_id = req.body.form_id + ',';
      
      dbhelper.insert('user_message', 
        'user_id, topic_list, remind_time, form_id_list',
        [openid, topic_list, remind_time, form_id],
        "ON DUPLICATE KEY UPDATE topic_list='" + topic_list + "'" + 
        ", remind_time='" + remind_time + "', " +
        "form_id_list=CONCAT(form_id_list, '" + form_id + "')",
        (status, errmsg) => {
          let error_code = status ? 200 : 100;
          res.send({ 'error_code': error_code, 'msg': '' });
        });
    };
  });
});


module.exports = router;
