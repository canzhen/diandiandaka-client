var express = require('express');
var mysql = require('mysql');
var {mysql : config} = require('../config.js');

/* 创建并返回一个新的Server */
function connectServer() {
  let client = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.pwd,
    database: config.db,
    timezone: config.timezone
  })
  return client;
}


/* ------------------- user表部分 -------------------- */
/* 
 * 往users表里插入一条新数据
 **/
function insertUser(openid, cb){
  let client = connectServer();
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
  let client = connectServer();

  let sql = 'UPDATE user SET ' + key + ' = ? WHERE user_id = ?';
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
  let client = connectServer();
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
  let client = connectServer();
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
  let client = connectServer();
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
  let client = connectServer();
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
  let client = connectServer();
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
/**
 * 往user_topic表里插入一条新的数据
 */
function insertUserTopic(user_id, topic_name, topic_url, insist_day, start_date, end_date, cb){
  let client = connectServer();
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



/**
 * 通过用户id获取usertopic信息，返回多条数据
 */
function getUserTopicByUserId(id, cb) {
  let client = connectServer();
  client.query(
    "SELECT * FROM user_topic WHERE user_id = ?", [id],
    function (err, result) {
      if (err) {
        console.log("get user_topic by id失败，失败信息:" + err.message);
      } else {
        console.log('get user_topic by id成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list);
    });

  client.end();
}


/**
 * 通过用户id更新usertopic信息
 * @param id: 用户的openid
 * @param key: 对应数据库里的列名
 * @param data: 更新成的值
 * @param cb: 回调函数
 */
function updateUserTopicByUserId(id, key, data, cb) {
  let client = connectServer();
  client.query(
    "UPDATE user_topic SET() VALUES() WHERE user_id = ?", [id],
    function (err, result) {
      if (err) {
        console.log("update user_topic by id失败，失败信息:" + err.message);
      } else {
        console.log('update user_topic by id成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list);
    });

  client.end();
}


/**
 * 通过用户id和topic名称获取usertopic信息，只返回一条
 */
function getUserTopicByUserIdTopicName(id, topic_name, cb) {
  let client = connectServer();
  client.query(
    "SELECT * FROM user_topic WHERE user_id = ? AND topic_name=?", 
    [id, topic_name],
    function (err, result) {
      if (err) {
        console.log("get user_topic by id and topic name失败，失败信息:" + err.message);
      } else {
        console.log('get user_topic by id and topic name成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list[0]);
    });

  client.end();
}

/**
 * user_topic表的打卡逻辑：
 * 查看上次更新时间和当前时间是否大于一天（24小时），
 * 如果大于，则insist_day设置为0，否则insist_day为之前的加一，
 * total_day则无论如何都+1
 */
function checkInsertuserTopic(id, topic_name, cb){
  let client = connectServer();
  let sql = "UPDATE user_topic SET insist_day = " +
    "CASE WHEN HOUR(timediff(now(), last_update_time)) > 24 THEN 1 " +
    "ELSE insist_day + 1 END, " +
    "total_day = total_day + 1 " +
    "WHERE user_id = ? AND topic_name = ?;";

  console.log(sql);

  client.query(
    sql, [id, topic_name],
    function (err, result) {
      if (err) {
        console.log("打卡记录user_topic表失败，失败信息:" + err.message);
      } else {
        console.log('打卡记录user_topic表成功');
      }
      console.log(result);
      cb(result['changedRows'] == 1); //回调函数传回结果
    });

  client.end();
}

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

  //user_topic部分
  getUserTopicByUserId,
  getUserTopicByUserIdTopicName,
  updateUserTopicByUserId,
  checkInsertuserTopic
};
