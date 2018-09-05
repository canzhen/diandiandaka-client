const express = require('express');
const config = require('../config.js');
const dbhelper = require('../helpers/dbhelper.js');
const redishelper = require('../helpers/redishelper.js');
const Promise = require('promise');
const router = express.Router();



/**
 * 打卡方法，同时涉及到topic_check表和user_topic表
 */
router.post('/check', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_check_delete_str = req.body.topic_check_delete_str,
    topic_check_delete_list = req.body.topic_check_delete_list,
    user_topic_update_list = req.body.user_topic_update_list,
    user_topic_insert_list = req.body.user_topic_insert_list,
    user_topic_update_reduce_list = req.body.user_topic_update_reduce_list,
    user_topic_update_column_map = req.body.user_topic_update_column_map,
    user_topic_count_number = req.body.user_topic_count_number;


  /* 处理删除打卡 */
  let processDelete = function(openid) {
    console.log('处理删除打卡')
    Promise.all([deleteTopicCheck(openid), reduceUserTopicData(openid)])
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
          if (user_topic_insert_list.length != 0)
            processAdd(openid);
        }
      }, (res) => { //如果失败
        res.send({ 'error_code': 100, 'msg': '' });
      })
  }



  /* 处理添加打卡 */
  let processAdd = function(openid) {
    console.log('处理添加打卡')
    // 如果成功，继续update check的数据
    Promise.all([updateUserTopic(openid), insertTopicCheck(openid)])
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
        // 如果都成功，则发送res.send， return成功的消息
        res.send({ 'error_code': 200, 'msg': '' });
      }, (res) => { //如果失败
        res.send({ 'error_code': 100, 'msg': '' });
      })
  }


  let deleteTopicCheck = function(openid) {
    console.log('【uncheck】 start deleting topic_check')
    return new Promise((resolve) => {
      if (topic_check_delete_list.length == 0) {
        resolve({ 'error_code': 200, 'msg': '' });
        return;
      }
      topic_check_delete_list.unshift(openid);
      dbhelper.deleteRow('topic_check',
        topic_check_delete_str,
        topic_check_delete_list,
        (status, errmsg) => {
          let error_code = status ? 200 : 100;
          resolve({ 'error_code': error_code, 'msg': errmsg })
        })
    })
  }


  /* 减少user_topic的打卡天数 */
  let reduceUserTopicData = function(openid) {
    return new Promise((resolve) => {
      if (topic_check_delete_list.length == 0) {
        resolve({ 'error_code': 200, 'msg': '' });
        return;
      }
      console.log('【uncheck】 start update user_topic')

    /**
     * 通过id和外键，uncheck当天打卡，并从topic_check表中找到最新打卡时间
     * 赋值给last_check_time 和 last_check_timestamp
     */
      let l = user_topic_update_reduce_list.length / 3;
      let sql = "insist_day = CASE topic_name ";
      for (let i = 0; i < l / 2; i++) sql += "WHEN ? THEN ? ";//insist_day

      sql += "ELSE insist_day END, total_day = CASE topic_name ";//total_day
      for (let i = 0; i < l / 2; i++) sql += "WHEN ? THEN ? ";

      sql += "ELSE total_day END, last_check_time = CASE topic_name ";//time
      for (let i = 0; i < l / 2; i++) {
        sql += "WHEN ? THEN ";
        sql += "(SELECT check_time from topic_check where user_id='" + openid + "' and topic_name=? ORDER BY check_time DESC limit 1) ";
      }

      sql += "ELSE last_check_time END";
      user_topic_update_reduce_list.push(openid);


      dbhelper.update('user_topic', sql, 'user_id = ?',
        user_topic_update_reduce_list,
        (status) => {
          if (status) 
            console.log('update reduce user_topic by id成功');
          else 
            console.log('update reduce user_topic by id失败');

          let error_code = status ? 200 : 100;
          resolve({ 'error_code': error_code, 'msg': '' })
        });
    })
  }


  /* update check 数据的 user_topic表 */
  let updateUserTopic = function(openid) {
    return new Promise((resolve) => {
      if (user_topic_update_list.length == 0) return;
      console.log('【check】start updating user_topic')


      user_topic_update_list.push(openid)

      dbhelper.updateMulti('user_topic', 
      user_topic_update_column_map, user_topic_update_list,
      'user_id = ?', (status) => {
          if (status)
            console.log('update user_topic by id成功');
          else
            console.log('update user_topic by id失败');

          let error_code = status ? 200 : 100;
          resolve({ 'error_code': error_code, 'msg': '' })
        });
    })
  };




  /* insert into topic_check 打卡数据 */
  let insertTopicCheck = function(openid) {
    console.log('【check】 start inserting into topic_check')
    return new Promise((resolve) => {

      console.log(user_topic_insert_list)

      
      for (let i in user_topic_insert_list)
        user_topic_insert_list[i].push("'" + openid + "'");

      dbhelper.insertMulti( //update topic_check，记录具体打卡详情
        'topic_check',
        'topic_name, check_time, check_timestamp, log, count, user_id',
        user_topic_insert_list, '',
        (status, errmsg) => {
          let error_code = status ? 200 : 100;
          resolve({ 'error_code': error_code, 'msg': errmsg })
        });
    })
  };


  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    /* 如果有要删除的，则先删除之前的数据，
    再把新的打卡数据加进去，避免加完又被删除 */
    if (topic_check_delete_list.length != 0) {
      // console.log('have something to delete')
      processDelete(openid);
    } else {
      // console.log('nothing to delete')
      processAdd(openid);
    }
  });
});










/**
 * 获取topic表的所有数据
 */
router.post('/getAllTopic', function (req, res) {
  let condition = (req.body.limit_num != undefined) ? 
                    'LIMIT ' + req.body.limit_num : '';
  dbhelper.select(
    'topic', '', '', [],
    'ORDER BY use_people_num DESC ' + condition,
    (status, result_list) => {
      // for (var i in result_list) {
        // result_list[i]['topic_url'] = result_list[i]['topic_url'];
      // }
      let error_code = status ? 200 : 100;
      res.send({
        'error_code': error_code,
        'result_list': result_list
      });
    });
});







/**
 * 获取topic表的所有数据
 */
router.post('/getAllTopicUrl', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let sessionid = req.header('session-id');
  redishelper.getValue(sessionid, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    dbhelper.select(
      'topic_url', 'url', "user_id=? or user_id=''", [openid], '',
      (status, result_list) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': '', 'result_list': '' });
          return;
        }
        for (var i in result_list) {
          result_list[i] = result_list[i]['url'];
        }
        res.send({ 'error_code': 200, 'msg': '', 'result_list': result_list });
      });
  });
});








/**
 * 添加一个新的图标url
 */
router.post('/insertTopicUrl', function (req, res) {
  let topic_url = req.body.url;
  let sessionid = req.header('session-id');

  redishelper.getValue(sessionid, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }
    topic_url = config.qiniu.prefix + topic_url;
    dbhelper.insert('topic_url', 'url, user_id', [topic_url, openid], '',
      (status) => {
        if (!status) {
          res.send({ 'error_code': 100, 'msg': '' });
          return;
        }
        res.send({ 'error_code': 200, 'msg': '' });
      });
  });
});







/**
 * 通过用户id在数据库中获取该用户的卡片列表
 */
router.post('/getUserTopic', function (req, res) {
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

    dbhelper.select('user_topic', '', 'user_id=?', [openid], 
      'ORDER BY create_time',
      (status, result) => {
        if (status) {
          //删除user_id，不要暴露给前端
          for (let i in result) {
            delete result[i].user_id;
          }
          res.send({ 'error_code': 200, 'msg': '', 'result_list': result });
          return;
        } else {
          res.send({ 'error_code': 100, 'msg': result, 'result_list': '' });
          return;
        }
      }
    );
  });
});








/**
 * 保存用户的卡片提醒设置
 */
router.post('/saveTopicRemindSettings', function (req, res) {
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

    let column_map = req.body.column_map,
        value_list = req.body.value_list;

    value_list.push(openid);

    dbhelper.updateMulti('user_topic', column_map, value_list,
      'user_id=?', (status, errmsg) => {
        let error_code = status ? 200 : 100;
        res.send({ 'error_code': error_code, 'msg': errmsg });
      });
  });
});



/**
 * 用户新增一个topic
 */
router.post('/create', function (req, res) {
  if (!req.body.topicname || !req.body.topicurl) return false;

  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }

  let topicname = req.body.topicname;
  let topicurl = req.body.topicurl;
  let startdate = req.body.startdate;
  let enddate = req.body.enddate;
  // 从redis里获取用户的唯一标识：openid
  let sessionid = req.header('session-id');

  redishelper.getValue(sessionid, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': 'redis数据库里找不到对应用户数据' });
      return;
    }

    /**
     * 更新topic表
     * 存在，则打卡人数加一；不存在，新增数据
     */
    let insertTopic = function(){
      return new Promise((resolve) => {
        dbhelper.insert('topic', 'topic_name, topic_url, use_people_num',
          [topicname, topicurl, 1],
          "ON DUPLICATE KEY UPDATE use_people_num=use_people_num+1",
          (status, errmsg) => {
            let error_code = status ? 200 : 100;
            resolve({ 'error_code': error_code, 'msg': '' });
          });
      });
    }


    /**
     * 往用户表里新增数据
     */
    let insertUserTopic = function(){
      let countphase = req.body.countphase;
      let countunit = req.body.countunit;
      let select_rank = "select use_people_num from topic where "+
                          "topic_name='" + topicname + "'";
      return new Promise((resolve) => {
        dbhelper.insert('user_topic',
          'user_id, topic_name, topic_url, start_date, end_date, rank,' + 
          'topic_count_phase, topic_count_unit',
          [], "'" + openid + "'," + "'" + topicname + "','" + topicurl + 
          "','" + startdate + "','" + enddate + "', (" + 
          select_rank + ")" + ",'" + countphase + "','"
          + countunit + "')",
          (status, errmsg) => {
            if (!status) {
              // let errReason = errmsg.substr(0, errmsg.indexOf(':'));
              if (errmsg == 'ER_DUP_ENTRY')
                resolve({ 'error_code': 101, 'msg': errmsg });
              else resolve({ 'error_code': 100, 'msg': errmsg });
            }
            resolve({ 'error_code': 200, 'msg': errmsg })
          });
      })
    }


    insertUserTopic()
    .then((result) => {
      if (result.error_code != 200){
        res.send({ error_code: result.error_code, msg: result.msg});
        return;
      }
      return insertTopic();
    }).then((result) => {
      if (result.error_code != 200) {
        res.send({ error_code: result.error_code, msg: result.msg });
        return;
      }
      res.send({ error_code: 200, msg: '' });
    })
  });
});








/**
 * 更新卡片信息
 */
router.post('/update', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }

  let id = req.header('session-id');
  let original_topic_name = req.body.original_topic_name,
      topic_name = req.body.topic_name,
      topic_url = req.body.topic_url,
      start_date = req.body.start_date,
      end_date = req.body.end_date,
      if_show_log = req.body.if_show_log,
      topic_count_phase = req.body.topic_count_phase,
      topic_count_unit = req.body.topic_count_unit;


  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }


    let updateUserTopic = function () {
      return new Promise((resolve) => {
        dbhelper.update('user_topic',
          'topic_name=?, topic_url=?, start_date=?, end_date=?,' + 
          'if_show_log=?, topic_count_phase=?, topic_count_unit=?',
          'user_id=? AND topic_name=?',
          [topic_name, topic_url, start_date, end_date, 
            if_show_log, topic_count_phase, topic_count_unit,
            openid, original_topic_name],
          (status, errmsg) => {
            console.log('updateUserTopic的状态是：' + status)
            if (!status) {
              if (errmsg == 'ER_DUP_ENTRY')
                resolve({ 'error_code': 101, 'msg': errmsg });
              else
                resolve({ 'error_code': 100, 'msg': errmsg });
            } else
              resolve({ 'error_code': 200, 'msg': '' });
          });
      });}


    let updateTopicCheck = function () {
      return new Promise((resolve) => {
        if (topic_name == original_topic_name) {
          resolve({ 'error_code': 200, 'msg': '' });
          return;
        }
        dbhelper.update('topic_check', 'topic_name=?',
          'user_id=? AND topic_name=?',
          [topic_name, openid, original_topic_name],
          (status, result_list) => {
            let statusCode = status ? 200 : 100;
            let resList = status ? result_list : false;
            resolve({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
          });
      });}


    let updateTopic = function () {
      return new Promise((resolve) => {
        if (topic_name == original_topic_name) {
          resolve({ 'error_code': 200, 'msg': '' });
          return;
        }
        // 把原来的topic_name的打卡人数减一
        dbhelper.update('topic', 'use_people_num=use_people_num-1',
          'topic_name=?', [original_topic_name],
          (status, errmsg) => {
            console.log('减少原来topic的人数: ' + status);
            if (!status) {
              resolve({ 'error_code': 100, 'msg': '' });
              return;
            }

            // 存在，则打卡人数加一；不存在，新增数据
            dbhelper.insert('topic', 'topic_name, topic_url, use_people_num',
              [topic_name, topic_url, 1],
              "ON DUPLICATE KEY UPDATE use_people_num=use_people_num+1",
              (status, errmsg) => {
                console.log(' 存在，则打卡人数加一；不存在，新增数据: ' + status);
                let error_code = status ? 200 : 100;
                resolve({ 'error_code': error_code, 'msg': '' });
              });
          });
      })}


    Promise.all([updateUserTopic(), updateTopicCheck(), updateTopic()])
    .then((result) => { //如果成功
      console.log(result)
      for (let i in result){
        if (result[i].error_code != 200){
          res.send({ 
            'error_code': result[i].error_code, 
            'msg': result[i].msg });
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
 * 删除卡片
 */
router.post('/delete', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;

  

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    let deleteTopicCheck = function () {
      return new Promise((resolve) => {
        dbhelper.deleteRow('topic_check', 
          'user_id=? AND topic_name=?',
          [openid, topic_name],
          (status, errmsg) => {
            if (status) resolve({ 'error_code': 200, 'msg': '' });
            else resolve({ 'error_code': 100, 'msg': errmsg });
          });
      })}

    let deleteUserTopic = function() {
      return new Promise((resolve) => {
        dbhelper.deleteRow('user_topic', 
        'user_id=? AND topic_name=?', 
        [openid, topic_name],
        (status, errmsg) => {
          if (status) resolve({ 'error_code': 200, 'msg': '' });
          else resolve({ 'error_code': 100, 'msg': errmsg });
        });
      })}


    let updateTopic = function () {
      return new Promise((resolve) => {
        dbhelper.update('topic',
          'use_people_num=use_people_num-1', 'topic_name=?',
          [topic_name],
          (status, errmsg) => {
            if (status) resolve({ 'error_code': 200, 'msg': '' });
            else resolve({ 'error_code': 100, 'msg': errmsg });
          });
      })
    }

    Promise.all([deleteTopicCheck(), deleteUserTopic(), updateTopic()])
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
 * 通过用户id和卡片名称在数据库中更新某一栏，
 * 并根据条件不同，更新多条数据
 */
router.post('/updateColumnMulti', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;
  let column_name = req.body.column_name;
  let column_value_list = req.body.column_value_list;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    column_value_list.push(openid)

    dbhelper.update('user_topic', column_name + '=?',
      "user_id = ?", column_value_list,
      (status, errmsg) => {
        if (status)
          res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': errmsg });
      });
  });
});






/**
 * 通过用户id和卡片名称在数据库中更新该条数据的某一栏
 */
router.post('/updateColumn', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;
  let column_name = req.body.column_name;
  let column_value = req.body.column_value;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    dbhelper.update('user_topic', column_name + '=?',
      "user_id = ? AND topic_name = ?",
      [column_value, openid, topic_name],
      (status, errmsg) => {
        if (status)
          res.send({ 'error_code': 200, 'msg': '' });
        else res.send({ 'error_code': 100, 'msg': errmsg });
      });
  });
});






/**
 * 获取某个用户的所有打卡记录
 */
router.post('/getAllCheckDataOfUser', function (req, res) {
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
    dbhelper.select('topic_check', 'topic_name, check_time, check_timestamp, count, log', 'user_id=?', [openid], 'ORDER BY check_time DESC, check_timestamp DESC',
      (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
      });
  });
});





/**
 * 更新某个打卡日志
 */
router.post('/updateCheckLog', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name;
  let check_time = req.body.check_time;
  let check_timestamp = req.body.check_timestamp;
  let log = req.body.log;
  let count = req.body.count;


  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    let column_string = '';
    let value_list = [];

    if (log) {
      value_list.push(log);
      column_string += 'log=?';
    }
    if (count) {
      value_list.push(count);
      if (column_string) column_string += ',';
      column_string += 'count=?';
    }


    value_list = value_list.concat([openid, topic_name, check_time, check_timestamp]);

    if (!log && !count) {
      res.send({ 
        'error_code': 200, 
        'msg': '', 
        'result_list': [] 
      });
      return;
    }

    dbhelper.update('topic_check', column_string,
      'user_id=? AND topic_name=? AND check_time=? AND check_timestamp=?',
      value_list, (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
      });
  });
});






/**
 * 更新某个用户所有卡片的完成度
 */
router.post('/saveCompleteRate', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let value_list = req.body.value_list;

  let column_map = {
    complete_rate: {
      condition_column: 'topic_name',
      condition_num: value_list.length / 2,
    }
  };

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }

    value_list.push(openid);
    dbhelper.updateMulti('user_topic', column_map, value_list,
      'user_id=?', (status, result_list) => {
        let statusCode = status ? 200 : 100;
        let resList = status ? result_list : false;
        res.send({ 'error_code': statusCode, 'msg': '', 'result_list': resList });
      });
  });
});





/**
 * 删除某次打卡记录
 */
router.post('/deleteCheck', function (req, res) {
  if (!req.header('session-id')) {
    res.send({ 'error_code': 103, 'msg': '用户未登录' });
    return;
  }
  let id = req.header('session-id');
  let topic_name = req.body.topic_name,
      check_time = req.body.check_time,
      check_timestamp = req.body.check_timestamp,
      last_check_time = req.body.last_check_time,
      reduce_day_num = req.body.reduce_day_num;

  redishelper.getValue(id, (openid) => {
    if (!openid) {
      res.send({ 'error_code': 102, 'msg': '' });
      return;
    }



    let deleteTopicCheck = function(){
      return new Promise((resolve) => {
        // 删除topic_check里的打卡记录
        dbhelper.deleteRow('topic_check',
          'user_id=? AND topic_name=? AND check_time=? AND check_timestamp=?',
          [openid, topic_name, check_time, check_timestamp],
          (status, errmsg) => {
            if (status) console.log('删除check记录成功');
            else console.log('删除check记录失败');
            let statusCode = status ? 200 : 100;
            resolve({ 'error_code': statusCode, 'msg': errmsg });
          });
      })
    }


    // 更新user_topic里的打卡数据
    let reduceUserTopicData = function(){
      return new Promise((resolve) => {
        if (reduce_day_num == 0) return;
        // 删除topic_check里的打卡记录
        dbhelper.update('user_topic', 
          'insist_day = insist_day - 1, total_day = total_day - ' +
          reduce_day_num +',' + 
          'last_check_time = ?',
          'user_id = ? AND topic_name = ?', 
          [last_check_time, openid, topic_name],
          (status, errmsg) => {
            if (status) console.log('删除check记录成功');
            else console.log('删除check记录失败');
            let statusCode = status ? 200 : 100;
            resolve({ 'error_code': statusCode, 'msg': errmsg });
          });
      })
    }

    Promise.all([deleteTopicCheck(), reduceUserTopicData()])
    .then((result) => { //如果成功
      // console.log(result)
      for (let i in result) {
        if (result[i].error_code != 200) {
          res.send({
            'error_code': result[i].error_code,
            'msg': result[i].msg
          });
          return;
        }
        res.send({ 'error_code': 200, 'msg': '' });
      }
    }, (res) => { //如果失败
      res.send({ 'error_code': 100, 'msg': '' });
    })

  });
});



module.exports = router;