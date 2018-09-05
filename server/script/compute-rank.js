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
      let getTopicUserMap = function () {
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

                if (map[topic_name] == undefined)
                  map[topic_name] = {};

                if (map[topic_name][user_id] == undefined)
                  map[topic_name][user_id] = {};

                map[topic_name][user_id].start_date = info.start_date;
                map[topic_name][user_id].insist_day = info.insist_day;
                map[topic_name][user_id].total_day = info.total_day;
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

                if (map[topic_name] == undefined)
                  map[topic_name] = {};
                if (map[topic_name][user_id] == undefined)
                  map[topic_name][user_id] = [];
                
                map[topic_name][user_id].push(info.check_time);
              }
              // console.log(map);
              resolve({ error_code: 200, result_list: map})
            });
        })
      }



      Promise.all([getTopicUserMap(), getCheckDataMap()])
      .then((res)=>{
        for (let i in res){
          if (res[i].error_code != 200){
            resolve(false);
            return;
          }
        }

        let topicUserMap = res[0].result_list;
        let checkDataMap = res[1].result_list;
        
        for (let topic_name in topicUserMap){
          for (let user_id in topicUserMap[topic_name]){
            let info = topicUserMap[topic_name][user_id];
            if (checkDataMap[topic_name] == undefined || 
                checkDataMap[topic_name][user_id] == undefined ||
                checkDataMap[topic_name][user_id].length == 0){
              info.total_day = 0;
              info.insist_day = 0;
              info.complete_rate = parseFloat(0);
              info.score = parseFloat(0);
              continue;
            }
            let check_info = checkDataMap[topic_name][user_id];
            let l = check_info.length;
            /** 计算总打卡天数 */
            info.total_day = l;
            // 没有打卡日期，或者最后打卡日期是两天前，insist_day都设为0
            let totalDayNum = moment().diff(moment(info.start_date, 'YYYY-MM-DD'), 'days') + 1;
            /** 计算完成度 */
            let endDate = moment(info.end_date, 'YYYY-MM-DD');
            // 如果在过期之后更新过，那么就不必再继续更新了，因为数值都已经不变了
            if (moment().diff(endDate, 'days') > 0 &&
              moment(info.update_time, 'YYYY-MM-DD').diff(endDate, 'days') > 0)
              continue;
              
            // 否则，没过期，或者过期了但是还没更新过，则继续算
            info.complete_rate = parseFloat(((l / totalDayNum) * 100).toFixed(2));
            // if (user_id == 'ovMv05aNpgwDcJd4PEqfBfVtA3cU' && topic_name == '闭关'){
            //   console.log(lastCheckDay.format('YYYY-MM-DD'))
            // }
            let today = moment();
            let lastCheckDay = moment(check_info[0], 'YYYY-MM-DD');
            if (today.diff(lastCheckDay, 'days') > 1) {
              info.insist_day = 0;
            }else{
              /** 计算连续天数 */
              let insist_day = 1; //至少有一天
              for (let i = 1; i < l; i++){
                // console.log(i);
                let currentCheckDay = moment(check_info[i], 'YYYY-MM-DD');
                // console.log('last check date: ' + lastCheckDay.format('YYYY-MM-DD'));
                // console.log('current date:' + currentCheckDay.format('YYYY-MM-DD'));
                // console.log('diff days: ' + lastCheckDay.diff(currentCheckDay, 'days'));
                if (lastCheckDay.diff(currentCheckDay, 'days') > 1) break;
                insist_day += 1;
                lastCheckDay = currentCheckDay.clone();
              }
              // console.log('insist day is : ' + insist_day)
              info.insist_day = insist_day;
            }

            info.score = parseFloat(((info.total_day + info.insist_day * 2) * info.complete_rate / 10).toFixed(2));
          }
        }
        // 循环结束



        // 开始根据score排序
        for (let topic_name in topicUserMap){
          let sortedKeys = Object.keys(topicUserMap[topic_name]).sort((a, b) => {
            return topicUserMap[topic_name][b].score - topicUserMap[topic_name][a].score;
          })

          // 排序完遍历map，记录rank
          let newMap = {}
          for (let i in sortedKeys){
            newMap[sortedKeys[i]] = topicUserMap[topic_name][sortedKeys[i]];
            newMap[sortedKeys[i]].rank = parseInt(i)+1;
          }
          topicUserMap[topic_name] = newMap;
        }


        resolve({ error_code: 200, result_list: topicUserMap});
        // resolve({error_code: 200});
      }, (res) => {
        writeLog('运行失败');
        resolve({ error_code: 100, result_list: [] });
      })

    })
  }






  /**
   * 第二步，根据坚持天数、总共天数以及完成度，计算出分数并排序
   */
  // let calculateScore = function(){
  //   return new Promise((resolve) => {

  //     // 先把分数计算出来
  //     dbhelper.update('user_topic', 
  //     'score = FORMAT((total_day + insist_day)*complete_rate/10, 2)',
  //     '', [], (status, errmsg) => {
  //       if (!status) {
  //         resolve(false);
  //         return;
  //       }

  //       // 利用mysql根据分数排序
  //       dbhelper.select('user_topic',
  //         'topic_name, user_id, score',
  //         '', [], 'ORDER BY topic_name, score DESC',
  //         (status, result) => {
  //           if (!status) {
  //             writeLog('1. 获取所有user的topic和score失败');
  //           }
  //           let topic_rate_map = {};

  //           // 生成user_map
  //           for (let i in result) {
  //             let topic_name = result[i]['topic_name'];
  //             let rank = 1;
  //             if (topic_rate_map[topic_name] == undefined) {
  //               topic_rate_map[topic_name] = [];
  //             } else {
  //               let l = topic_rate_map[topic_name].length - 1;
  //               if (result[i]['score'] ==
  //                 topic_rate_map[topic_name][l]['score'])
  //                 rank = topic_rate_map[topic_name][l]['rank'];
  //               else
  //                 rank = topic_rate_map[topic_name][l]['rank'] + 1;
  //             }


  //             topic_rate_map[topic_name].push({
  //               user_id: result[i]['user_id'],
  //               score: result[i]['score'],
  //               rank: rank
  //             })
  //           }
  //           resolve(topic_rate_map)
  //         })
  //     });

  //   })
  // }





  /**
   * update数据库，更新：
   * 1. total_day
   * 2. insist_day
   * 3. complete_rate
   * 4. score
   * 5. rank
   */
  
  let updateRank = function (topic_rate_map){
    return new Promise((resolve)=>{
      if (!topic_rate_map){
        resolve(false);
        return;
      }

      let updateColumnNum = 5; //更新5栏

      let updateOneTopic = function (topic_name, value_list) {
        
        let updateConditionNum = value_list.length / updateColumnNum / 2;
        return new Promise((resolve) => {
          let column_map = {
            total_day: {
              condition_column: 'user_id',
              condition_num: updateConditionNum
            }, insist_day: {
              condition_column: 'user_id',
              condition_num: updateConditionNum
            }, complete_rate: {
              condition_column: 'user_id',
              condition_num: updateConditionNum
            }, score: {
              condition_column: 'user_id',
              condition_num: updateConditionNum
            }, rank: {
              condition_column: 'user_id',
              condition_num: updateConditionNum
            }
          }

          dbhelper.updateMulti('user_topic', column_map, value_list,
            "topic_name='" + topic_name + "'",
            (status, errmsg) => {
              if (status) {
                writeLog('update' + topic_name + '的打卡数据【成功】');
                resolve(true);
              } else {
                writeLog('update' + topic_name + '的打卡数据【失败】');
                resolve(false);
              }
            });
        })
      }



      let promiseList = [];
      for (let topic_name in topic_rate_map) {
        let value_list = [];

        for (let user_id in topic_rate_map[topic_name]) {
          value_list.push(user_id);
          value_list.push(topic_rate_map[topic_name][user_id]['total_day']);
        }

        for (let user_id in topic_rate_map[topic_name]) {
          value_list.push(user_id);
          value_list.push(topic_rate_map[topic_name][user_id]['insist_day']);
        }

        for (let user_id in topic_rate_map[topic_name]) {
          value_list.push(user_id);
          value_list.push(topic_rate_map[topic_name][user_id]['complete_rate']);
        }

        for (let user_id in topic_rate_map[topic_name]) {
          value_list.push(user_id);
          value_list.push(topic_rate_map[topic_name][user_id]['score']);
        }

        for (let user_id in topic_rate_map[topic_name]) {
          value_list.push(user_id);
          value_list.push(topic_rate_map[topic_name][user_id]['rank']);
        }

        promiseList.push(updateOneTopic(topic_name, value_list));
      }

      resolve(promiseList);
    })
  }





  calculateCompletenessRate(now)
  .then((res) => {
    if (res.error_code != 200 || !res.result_list) {
      writeLog('脚本执行失败...');
      process.exit(0);
    }
    // console.log(res.result_list)
    // process.exit(0);
    return updateRank(res.result_list);
  })
  .then((promiseList) => {
    Promise.all(promiseList).then((result) => {
      writeLog('脚本执行结束....');
      process.exit(0);
    })
  })
}


let now = Date.now();
writeLog('脚本开始执行....')
startComputeRank(now)
