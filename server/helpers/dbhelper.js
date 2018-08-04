var express = require('express');
var mysql = require('mysql');
var {mysql : config} = require('../config.js');



/**
 * 创建并返回一个新的Server
 */
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




/**
 * 从表中SELECT
 * @param table_name: 表名，string
 * @param column_string: 要选择的栏，以英文逗号分隔，string（id,name,..)
 * @param condition_string: 跟在where后面的string，例如id=? AND name=?
 * @param condition_list: 添加在query后面的list，对应condition_string中的问号
 * @param other_operation_string: 要跟在select后的其他操作符，例如排序ORDER BY use_people_num DESC LIMIT等等
 */
function select(table_name, column_string, condition_string, condition_list, other_operation_string, cb) {
  let client = connectServer();
  column_string = column_string ? column_string : '*';
  let sql = 'SELECT ' + column_string + ' FROM ' + table_name + ' ';
  if (condition_string != '') sql += 'WHERE ' + condition_string;
  sql += other_operation_string;

  client.query(
    sql, condition_list,
    function (err, result) {
      if (err) {
        console.log('从' + table_name + '表中获取信息失败，失败原因:' + err.message);
      } else {
        console.log('从' + table_name + '表中获取信息成功');
      }

      let result_list = JSON.parse(JSON.stringify(result));
      cb(!err, result_list);
    });

  client.end();
}


/**
 * 向表中新增一条数据
 * @param table_name: 表名称，string
 * @param column_string: 要添加的栏，以英文逗号分隔，string（id,name,..)
 * @param value_list: 要添加进去的value，list
 * @param other_operation_string: 要跟在insert后的其他操作符，例如on duplicate key update等等
 * @cb(status是否成功, errmsg错误信息): 如果是duplicate的话，status为false，errmsg为"duplicate"
 */
function insert(table_name, column_string, value_list, other_operation_string, cb) {
  let client = connectServer();
  sql = "INSERT INTO " + table_name + "(" + column_string + ") VALUES(?";
  for (let i = 1; i < value_list.length; i++) sql += ",?";
  sql += ") ";
  sql += other_operation_string;

  client.query(
    sql, value_list,
    function (err, result) {
      let errmsg = '';
      if (err) {
        errmsg = err.message;
        console.log('insert ' + table_name + '表失败，失败信息:' + err.message);
      } else {
        if (result['changedRows'] == 0) { //为0代表duplicate key
          cb(true, 'duplicate');
          return;
        }
        console.log('insert ' + table_name + '表成功');
      }
      cb(!err, errmsg); //回调函数
    });

  client.end();
}



/**
 * 更新表中的一行数据
 * @param table_name: 表名，string
 * @param column_string: 写有column的string，例如id=?, name=?
 * @param value_list: value 的list，例如[2349018, 'canzhen', ...]
 * @param condition_string: 跟在where后面的string，例如id=? AND name=?
 * @cb: 回调函数 (bool是否成功，errmsg错误信息)
 */
function update(table_name, column_string, value_list, condition_string, cb){
  console.log(column_string);
  let client = connectServer();
  let sql = 'UPDATE ' + table_name + ' SET ' + column_string;
  if (condition_string != '')
    sql += ' WHERE ' + condition_string;

  console.log(sql);

  client.query(sql, value_list, 
    function (err, result) {
      if (err) {
        console.log('update ' + table_name + ' 失败，失败信息:' + err.message);
        cb(false, err.message);
      } else {
        console.log('update ' + table_name + ' 成功');
        cb(true, '');
      }
  });
  client.end();
}



/**
 * 通过用户id更新usertopic信息
 * @param id: 用户的openid
 * @param list: maplist:['topic_name': '', insist_day':'', 'topic_name': '', 'total_day':'', 'topic_name': '', 'if_show_log': 0]
 * @param cb: 回调函数
 */
function updateUserTopicNumberByUserId(id, list, cb) {
  let client = connectServer();
  let l = list.length / 3;
  let sql = "UPDATE user_topic " +  
            "SET insist_day = CASE topic_name ";
  for (let i=0; i < l/2; i++) sql += "WHEN ? THEN ? ";
  sql += "ELSE insist_day END, total_day = CASE topic_name ";
  for (let i = 0; i < l / 2; i++) sql += "WHEN ? THEN ? ";
  sql += "ELSE total_day END, if_show_log = CASE topic_name ";
  for (let i = 0; i < l / 2; i++) sql += "WHEN ? THEN ? ";
  sql += "ELSE if_show_log END WHERE user_id = ?;"
  list.push(id);

  client.query(
    sql, list,
    function (err, result) {
      if (err) {
        console.log("update user_topic by id失败，失败信息:" + err.message);
      } else {
        console.log('update user_topic by id成功');
      }
      cb(!err);
    });

  client.end();
}

module.exports = {
  connectServer,
  insert,
  select, 
  update,


  //user_topic部分
  updateUserTopicNumberByUserId,
};
