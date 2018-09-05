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
function startComputeRank(now) {

  /**
   * 第一步，计算每个用户的每个卡片的完成度
   */
  let calculateCompletenessRate = function(now){

    return new Promise((resolve) => {

      /** 获取用户卡片表 */
      let getUserTopicMap = function () {
        return new Promise((resolve) => {
          dbhelper.select('user_topic', '', '', [],
            '', (status, result) => {
              let map = {};
              if (!status){
                resolve({ error_code: 100, result_list: map });
                return;
              }

              for (let i in result) {
                let info = result[i];
                let user_id = info.user_id;
                let topic_name = info.topic_name;

                if (map[user_id] == undefined)
                  map[user_id] = {};

                if (map[user_id][topic_name] == undefined)
                  map[user_id][topic_name] = {};

                map[user_id][topic_name].start_date = info.start_date;
                map[user_id][topic_name].insist_day = info.insist_day;
                map[user_id][topic_name].total_day = info.total_day;
              }
              resolve({ error_code: 200, result_list: map});
            });
        })
      }


      /** 获取具体的打卡信息表 */
      let getCheckDataMap = function () {
        return new Promise((resolve) => {
          dbhelper.select('topic_check', 
          'user_id, topic_name, check_time', 
          '', [], 'ORDER BY check_time DESC',
            (status, result_list) => {
              if (result_list.length == 0){
                resolve({error_code: 200, result_list: []});
                return;
              }
              let map = {};
              for (let i in result_list){
                let info = result_list[i];
                let user_id = info.user_id;
                let topic_name = info.topic_name;
                if (map[user_id] == undefined)
                  map[user_id] = {};
                if (map[user_id][topic_name] == undefined)
                  map[user_id][topic_name] = [];
                else
                  map[user_id][topic_name].push(info.check_time);
              }
              // console.log(map);
              resolve({ error_code: 200, result_list: map})
            });
        })
      }


      Promise.all([getUserTopicMap(), getCheckDataMap()])
      .then((res)=>{
        for (let i in res){
          if (res[i].error_code != 200){
            resolve(false);
            return;
          }
        }

        let userTopicMap = res[0].result_list;
        let checkDataMap = res[1].result_list;



        writeLog(Date.now() - now);
      }, (res) => {
        writeLog('运行失败')
      })

    })
  }



  /**
   * 第二步，根据坚持天数、总共天数以及完成度，计算出分数并排序
   */
  let calculateScore = function(){
    return new Promise((resolve) => {

      // 先把分数计算出来
      dbhelper.update('user_topic', 
      'score = FORMAT((total_day + insist_day)*complete_rate/10, 2)',
      '', [], (status, errmsg) => {
        if (!status) {
          resolve(false);
          return;
        }

        // 利用mysql根据分数排序
        dbhelper.select('user_topic',
          'topic_name, user_id, score',
          '', [], 'ORDER BY topic_name, score DESC',
          (status, result) => {
            if (!status) {
              writeLog('1. 获取所有user的topic和score失败');
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
                if (result[i]['score'] ==
                  topic_rate_map[topic_name][l]['score'])
                  rank = topic_rate_map[topic_name][l]['rank'];
                else
                  rank = topic_rate_map[topic_name][l]['rank'] + 1;
              }


              topic_rate_map[topic_name].push({
                user_id: result[i]['user_id'],
                score: result[i]['score'],
                rank: rank
              })
            }

            resolve(topic_rate_map)
          })
      });

    })
  }


  // update数据库，记录rank
  let updateRank = function (topic_rate_map){
    return new Promise((resolve)=>{
      if (!topic_rate_map){
        resolve(false);
        return;
      }

      let updateOneTopic = function (topic_name, value_list) {
        return new Promise((resolve) => {
          let column_map = {
            rank: {
              condition_column: 'user_id',
              condition_num: value_list.length / 2
            }
          }

          dbhelper.updateMulti('user_topic', column_map, value_list,
            "topic_name='" + topic_name + "'",
            (status, errmsg) => {
              if (status) {
                writeLog('update' + topic_name + '的排名【成功】');
                resolve(true);
              } else {
                writeLog('update' + topic_name + '的排名【失败】');
                resolve(false);
              }
            });
        })
      }




      let promiseList = [];
      for (let topic in topic_rate_map) {
        let value_list = [];
        for (let i in topic_rate_map[topic]) {
          value_list.push(topic_rate_map[topic][i]['user_id']);
          value_list.push(topic_rate_map[topic][i]['rank']);
        }
        promiseList.push(updateOneTopic(topic, value_list));
      }

      resolve(promiseList);
    })
  }


  calculateCompletenessRate(now)
  .then(() => {
    // return calculateScore();
    writeLog('脚本运行时间：' + Date.now() - now)
  })
  // .then((topic_rate_map) => {
  //   return updateRank(topic_rate_map);
  // }).then((promiseList) => {
  //   Promise.all(promiseList).then((result) => {
  //     writeLog('脚本执行结束....');
  //     process.exit(0);
  //   })
  // })
}


let now = Date.now();
writeLog('脚本开始执行....')
startComputeRank(now)
