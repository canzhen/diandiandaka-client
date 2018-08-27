const dbhelper = require('../helpers/dbhelper.js');
const messagehelper = require('../helpers/messagehelper.js');
const smshelper = require('../helpers/smshelper.js')
const utils = require('../helpers/utils.js');
const moment = require('moment');
const Promise = require('promise');

function writeLog(log) {
  console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] ' + log);
}

/** 开始发送消息 */
function startComputeRank() {
  let getCompleteRateFromDB = function(){
    return new Promise((resolve) => {
      dbhelper.select('user_topic',
        'topic_name, user_id, complete_rate',
        '', [], 'ORDER BY topic_name, complete_rate DESC',
        (status, result) => {
          if (!status) {
            writeLog('1. 获取所有user的topic和complete_rate失败');
          }
          let topic_rate_map = {};

          // 生成user_map
          for (let i in result) {
            let topic_name = result[i]['topic_name'];
            let rank = 1;
            if (topic_rate_map[topic_name] == undefined) {
              topic_rate_map[topic_name] = [];
            } else {
              let l = topic_rate_map[topic_name].length - 1;
              if (result[i]['complete_rate'] ==
                topic_rate_map[topic_name][l]['complete_rate'])
                rank = topic_rate_map[topic_name][l]['rank'];
              else
                rank = topic_rate_map[topic_name][l]['rank'] + 1;
            }


            topic_rate_map[topic_name].push({
              user_id: result[i]['user_id'],
              complete_rate: result[i]['complete_rate'],
              rank: rank
            })
          }

          resolve(topic_rate_map)
        })
    })
  }


  // update数据库，记录rank
  let updateRank = function (topic_rate_map){

    return new Promise((resolve)=>{
      let updateOneTopic = function (topic_name, value_list) {
        let column_map = {
          rank: {
            condition_column: 'user_id',
            condition_num: value_list.length / 2
          }
        }
        dbhelper.updateMulti('user_topic', column_map, value_list,
          "topic_name='" + topic_name + "'",
          (status, errmsg) => {
            if (status) writeLog('update' + topic_name + '的排名【成功】')
            else writeLog('update' + topic_name + '的排名【失败】')
          });
      }

      for (let topic in topic_rate_map) {
        let value_list = [];
        for (let i in topic_rate_map[topic]) {
          value_list.push(topic_rate_map[topic][i]['user_id']);
          value_list.push(topic_rate_map[topic][i]['rank']);
        }
        updateOneTopic(topic, value_list);
      }
    })
  }



  getCompleteRateFromDB().then((topic_rate_map) => {
    return updateRank(topic_rate_map);
  }).then(()=>{
    console.log('结束了')
  })
 
}


writeLog('starting....')
startComputeRank()