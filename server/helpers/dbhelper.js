const express = require('express');
const mysql = require('mysql');
const {mysql : config} = require('../config.js');



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
      cb(!err, result);
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
  sql = 'INSERT INTO ' + table_name + '(' + column_string + ') VALUES(';
  for (let i = 0; i < value_list.length; i++){
    if (i == value_list.length - 1) sql += '?) ';
    else sql += '?,';
  }
  sql += other_operation_string;
  
  // console.log(sql)
  // console.log(value_list)

  client.query(
    sql, value_list,
    function (err, result) {
      console.log(err)
      console.log(result)
      if (err) {
        console.log('insert ' + table_name + '表失败，失败信息:' + err.message);
        cb(false, err.code);
      } else {
        if (result['changedRows'] == 0) { //为0代表duplicate key
          console.log('insert, duplicate key')
          cb(true, 'duplicate');
          return;
        }
        console.log('insert ' + table_name + '表成功');
      }
    });

  client.end();
}





/**
 * 向表中新增多条数据
 * @param table_name: 表名称，string
 * @param column_string: 要添加的栏，以英文逗号分隔，string（id,name,..)
 * @param value_list: 要添加进去的value，list of list：[[], [], [],...]
 * @param other_operation_string: 要跟在insert后的其他操作符，例如on duplicate key update等等
 * @cb(status是否成功, errmsg错误信息): 如果是duplicate的话，status为false，errmsg为"duplicate"
 */
function insertMulti(table_name, column_string, value_list, other_operation_string, cb) {
  let client = connectServer();
  sql = "INSERT INTO " + table_name + "(" + column_string + ") VALUES(";
  for (let i = 0; i < value_list.length; i++) {
    sql += value_list[i].toString() + ")";
    if (i != value_list.length - 1) sql += ", (";
  }
  sql += ' ';
  sql += other_operation_string;

  // console.log(sql)
  // console.log(value_list)

  client.query(
    sql, value_list,
    function (err, result) {
      let errmsg = '';
      if (err) {
        errmsg = err.message;
        console.log('insert ' + table_name + '表【多列】失败，失败信息:' + err.message);
      } else {
        if (result['changedRows'] == 0) { //为0代表duplicate key
          cb(true, 'duplicate');
          return;
        }
        console.log('insert ' + table_name + '表【多列】成功');
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
// function insertOrUpdate(table_name, column_string, column_value, condition_string, value_list, cb){
//   let client = connectServer();
//   let sql = 'REPLACE INTO ' + table_name + '(' + column_string + ') VALUES(' + column_value + ')';
//   if (condition_string != '')
//     sql += ' WHERE ' + condition_string;

//   client.query(sql, value_list, 
//     function (err, result) {
//       let status = true, errmsg = '';
//       if (err) {
//         console.log('update ' + table_name + ' 失败，失败信息:');
//         console.log(err)
//         status = false;
//         errmsg = err.code;
//       } else {
//         console.log('update ' + table_name + ' 成功');
//       }
//       cb(status, errmsg);
//   });
//   client.end();
// }


/**
 * 更新表中的一行数据
 * @param table_name: 表名，string
 * @param column_string: 写有column的string，例如id=?, name=?
 * @param value_list: value 的list，例如[2349018, 'canzhen', ...]
 * @param condition_string: 跟在where后面的string，例如id=? AND name=?
 * @cb: 回调函数 (bool是否成功，errmsg错误信息)
 */
function update(table_name, column_string, condition_string, value_list, cb){
  let client = connectServer();
  let sql = 'UPDATE ' + table_name + ' SET ' + column_string;
  if (condition_string != '')
    sql += ' WHERE ' + condition_string;


  // console.log(sql)
  // console.log(value_list)

  client.query(sql, value_list,
    function (err, result) {
      if (err) {
        console.log('update ' + table_name + ' 失败，失败信息:');
        console.log(err.message)
        cb(false, err.code);
      } else {
        console.log('update ' + table_name + ' 成功');
        cb(true, '');
      }
    });
  client.end();
}




/**
 * 更新表中的一行数据
 * @param table_name: 表名，string
 * @param column_map: {
 *    'update_column' : {
 *       'condition_column':'',
 *       'condition_num': 4
 *    },
 *    '': {},
 *    '': {},
 *    .....
 * }
 * @param value_list: value 的list，例如[2349018, 'canzhen', ...]
 * @param condition_string: 跟在where后面的string，例如id=? AND name=?
 * @cb: 回调函数 (bool是否成功，errmsg错误信息)
 */
function updateMulti(table_name, column_map, value_list, condition_string, cb) {
  let client = connectServer();
  let sql = 'UPDATE ' + table_name + ' SET ';

  for (let update_column in column_map){
    sql += update_column + ' =  CASE '
    let condition = column_map[update_column];
    sql += condition.condition_column + ' ';
    for (let j = 0; j < condition.condition_num; j++){
      sql += 'WHEN ? THEN ? '
    }
    sql += 'ELSE ' + update_column + ' END,';
  }
  sql = sql.substr(0, sql.length - 1) //去掉最后一个逗号


  if (condition_string != '')
    sql += ' WHERE ' + condition_string;

  // console.log(sql)
  // console.log(value_list)

  client.query(sql, value_list,
    function (err, result) {
      if (err) {
        console.log('update ' + table_name + ' 失败，失败信息:');
        console.log(err.message)
        cb(false, err.code);
      } else {
        console.log('update ' + table_name + ' 成功');
        cb(true, '');
      }
    });
  client.end();
}


/**
 * 从数据库中删除数据
 * @param table_name: 表名
 * @param column_string: 栏名： topic_name=? AND check_time=? AND ...
 * @param value_list: [] 和?相对应的数据列表
 */
function deleteRow(table_name, column_string, value_list, cb){
  let client = connectServer();
  sql = 'DELETE FROM ' + table_name + ' WHERE ' + column_string;

  // console.log(sql)
  // console.log(value_list)
  
  client.query(
    sql, value_list,
    function (err, result) {
      let errmsg = '';
      if (err) {
        errmsg = err.message;
        console.log('delete from ' + table_name + '表失败，失败信息:' + err.message);
      } else {
        if (result['changedRows'] == 0) { //为0代表duplicate key
          console.log('delete nothing');
          cb(true, 'delete nothing');
          return;
        }
        console.log('delete from ' + table_name + '表成功，删除了' + result['changedRows']+ '行');
      }
      cb(!err, errmsg); //回调函数
    });

  client.end();
}

module.exports = {
  connectServer,
  insert,
  insertMulti,
  // insertOrUpdate,
  select, 
  update,
  updateMulti,
  deleteRow,
};
