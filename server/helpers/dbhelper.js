var express = require('express');
var mysql = require('mysql');
var {mysql : config} = require('../config.js');

/* 创建并返回一个新的Server */
function connectServer() {
  var client = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.pwd,
    database: config.db
  })
  return client;
}


/* ------------------- user表部分 -------------------- */
/* 
 * 往users表里插入一条新数据
 **/
function insertUser(openid, cb){
  var client = connectServer();
  client.query(
    'INSERT INTO user(user_id) VALUES(?)', 
    [openid],
    function (err, result) {
      if (err) {
        console.log("insert user 失败，失败信息:" + err.message);
        cb(false, err.message);
      }else{
        console.log('insert user 成功');
        cb(true, '');
      }
    });
    client.end();
}

/**
 * 更新用户表的数据
 * @param keylist: 表里对应的列的list
 * @param valuelist: 要更新的值的list
 */
function updateUser(key, value, id, cb) {
  var client = connectServer();

  let sql = 'UPDATE user SET ' + key + ' = ? WHERE user_id = ?';

  console.log('update user, sql 语句是：' + sql);
  console.log(value);

  client.query(sql, [value, id], function (err, result) {
    if (err) {
      console.log("update user 失败，失败信息:" + err.message);
      cb(false, err.message);
    } else {
      console.log('update user 成功');
      cb(true, '');
    }
  });
  client.end();
}


/* 
 * 通过openid获取user的具体信息
 **/
function getUserById(id, cb) {
  var client = connectServer();
  client.query(
    "SELECT * FROM user WHERE user_id = ?" , [id],
    function (err, result) {
      if (err) {
        console.log("get user by id失败，失败信息:" + err.message);
      } else {
        console.log('get user by id成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list);
    });

  client.end();
}


/* ------------------- topic表部分 -------------------- */
/* 
 * 往topic表里插入一条新数据，默认使用人数为1（创建卡片的人）
 **/
function insertTopic(topicname, topicurl, usenum = 1, cb) {
  var client = connectServer();
  client.query(
    'INSERT INTO topic(topic_name, topic_url, use_people_num) VALUES(?, ?, ?)',
    [topicname, topicurl, usenum],
    function (err, result) {
      if (err) {
        console.log("insert topic 失败，失败信息:" + err.message);
      } else {
        console.log('insert topic 成功');
      }
      cb(!err); //回调函数
    });

  client.end();
}


/* 
 * 更新使用该topic的人数
 **/
function checkTopic(topicname, cb) {
  var client = connectServer();
  client.query(
    "SELECT count(*) FROM topic WHERE topic_name=?",
    [topicname],
    function (err, result) {
      if (err) {
        console.log("update topic 信息失败，失败信息:" + err.message);
      } else {
        console.log('update topic 信息成功');
      }
      result = JSON.parse(JSON.stringify(result))[0]['count(*)'];
      cb(result); //回调函数传回结果
    });

  client.end();
}


/* 
 * 更新使用该topic的人数
 **/
function updateTopic(topicname, cb) {
  var client = connectServer();
  client.query(
    "UPDATE topic SET use_people_num = use_people_num + 1 WHERE topic_name=?",
    [topicname],
    function (err, result) {
      if (err) {
        console.log("check topic 信息失败，失败信息:" + err.message);
      } else {
        console.log('check topic 信息成功');
      }
      cb(result['changedRows'] == 1); //回调函数传回结果
    });

  client.end();
}


/* 
 * 获取topic表的所有数据
 **/
function getTopic(limit_num, cb) {
  var client = connectServer();
  let queryStr = limit_num != -1 ? 
                 'SELECT * FROM topic ORDER BY use_people_num DESC LIMIT ' + limit_num :
                 'SELECT * FROM topic';
  client.query(
    queryStr, [],
    function (err, result) {
      if (err) {
        console.log("get topic 信息失败，失败信息:" + err.message);
      } else {
        console.log('get topic 信息成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list);
    });

  client.end();
}


/* ------------------- user_topic表部分 -------------------- */
function insertUserTopic(user_id, topic_name, topic_url, insist_day, start_date, end_date, cb){
  var client = connectServer();
  client.query(
    "INSERT INTO user_topic(user_id, topic_name, topic_url, insist_day, start_date, end_date) VALUES(?, ?, ?, ?, ?, ?)", 
    [user_id, topic_name, topic_url, insist_day, start_date, end_date],
    function (err, result) {
      let errmsg = '';
      if (err) {
        errmsg = err.message;
        console.log("insert user_topic表失败，失败信息:" + err.message);
      } else {
        console.log('insert user_topic表成功');
      }
      cb(!err, errmsg); //回调函数
    });

  client.end();
}



/* ------------------- user_topic表部分 -------------------- */



module.exports = {
  connectServer,

  //user部分
  insertUser,
  updateUser,
  getUserById,

  //topic部分
  insertTopic,
  updateTopic,
  checkTopic,
  getTopic,
  insertUserTopic,
};
