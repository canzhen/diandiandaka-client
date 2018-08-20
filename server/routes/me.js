const express = require('express');
const config = require('../config.js');
const utils = require('../helpers/utils.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const Promise = require('promise');
const router = express.Router();



/**
 * 保存用户的设置，包括用户的form_id一起存
 */
router.post('/saveSettings', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    //1. 保存用户信息到user表
        

    let updateUser = function(){
      return new Promise((resolve) => {
        let user_name = req.body.user_name,
          province = req.body.province,
          city = req.body.city,
          county = req.body.county,
          gender = req.body.gender;


        dbhelper.update('user',
          'user_name=?, province=?, city=?, county=?, gender=?',
          'user_id=?',
          [user_name, province, city, county, gender, openid],
          (status, errmsg) => {
            let error_code = status ? 200 : 100;
            resolve({ 'error_code': error_code, 'msg': errmsg });
          });
      });
    }

    


    //2. 保存用户要通知的topic和form_id到user_message表
    let updateUserMessage = function(){
      return new Promise((resolve) => {
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
            resolve({ 'error_code': error_code, 'msg': errmsg });
          });
      })
    };

    Promise.all([updateUser(), updateUserMessage()])
    .then((result) => { //如果成功
      console.log(result)
      for (let i in result) {
        if (result[i].error_code != 200) {
          res.send({
            'error_code': result[i].error_code,
            'msg': result[i].msg
          });
          return;
        }
      }
      res.send({ 'error_code': 200, 'msg': '' });
    }, (res) => { //如果失败
      res.send({ 'error_code': 100, 'msg': '' });
    });

  });
});





/**
 * 获取的用户的提醒设置
 */
router.post('/getRemindSettings', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.select('user_message', '', 'user_id=?', [openid], '',
    (status, result_list) => {
      if (!status) {
        cosole.log('get settings 失败');
        res.send({'error_code': 100, 'msg': '', 'result_list': []});
        return;
      }
      res.send({'error_code': 200, 
                'msg': '', 
                'result_list': result_list });
    });
  });
});



/**
 * 获取的用户的提醒设置
 */
router.post('/getUserInfo', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.select('user', 'province, city, county, gender', 
      'user_id=?', [openid], '',
      (status, result_list) => {
        if (!status) {
          cosole.log('get settings 失败');
          res.send({ 'error_code': 100, 'msg': '', 'result_list': [] });
          return;
        }
        res.send({
          'error_code': 200,
          'msg': '',
          'result_list': result_list
        });
      });
  });
});



module.exports = router;
