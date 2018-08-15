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
        gender = req.body.gender,
        form_id = req.body.form_id + ',';
        
    dbhelper.update('user', 
    'user_name=?, province=?, city=?, county=?, gender=?,'+
    'form_id_list=CONCAT(form_id_list, ?)', 
    'user_id=?', 
      [user_name, province, city, county, gender, form_id, openid],
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
          remind_time = req.body.remind_time;
      dbhelper.insertOrUpdate(
        'user_message', //table name
        'user_id, topic_list, remind_time', //column string
        "'" + openid + "','" + topic_list + "','" + remind_time + "'", 
        '', [], (status, errmsg) => {
          if (status) res.send({ 'error_code': 200, 'msg': '' });
          else res.send({ 'error_code': 100, 'msg': errmsg });
        });
    };
  });
});


module.exports = router;
