const config = require('./config.js');
const dbhelper = require('./helpers/dbhelper.js');
const messagehelper = require('./helpers/messagehelper.js');
const utils = require('./helpers/utils.js');
const moment = require('moment');
const Promise = require('promise');

const perseveranceList = 
['坚持不懈才能积沙成塔', 
 '契而舍之，朽木不折；契而不舍，金石可偻。',
 '苟有恒，何必三更起五更眠；最无益，只怕一日曝十日寒。',
 '一日一钱，十日十钱。绳锯木断，水滴石穿。',
 '人生在勤，不索何获。',
 '业精于勤而荒于嬉，行成于思而毁于随。',
 '盛年不再来，一日难再晨，及时当勉励，岁月不待人。',
 '不经一番寒彻骨，怎得梅花扑鼻香？',
 '流水不腐，户枢不蠹，民生在勤。',
 '合抱之木，生于毫末；九层之台，起于垒土；千里之行，始于足下。',
 '勤学如春起之苗，不见其增，日有所长。'];

/** 模拟阻塞方法 */
function sleep(milliSeconds) {
  var startTime = new Date().getTime();
  while (new Date().getTime() < startTime + milliSeconds);
}

function writeLog(log){
  console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] ' + log);
}

/** 开始发送消息 */
function startSendMessage(){
  /** 遍历user_message表 */ 
  dbhelper.select('user_message', '', '', [], '',
  (status, result) => {
    if (!status){
      writeLog('1. 遍历user_message表失败');
      return;
    }
    if (result.length == 0) return;
    let user_topic_list = result;
    let topic_use_map = {};

    /* 获取所有topic的使用人数，生成topic_use_map */
    dbhelper.select('topic', 'topic_name, use_people_num', '', [], '',
    (status, result) => {
      if (!status) {
        writeLog('2. 获取所有topic的使用人数失败');
      }
      // 生成topic_use_map
      for (let i in result) {
        topic_use_map[result[i]['topic_name']] =
          result[i]['use_people_num'];
      }

      /* 遍历user_topic_list，给每个user的每个topic发送通知 */
      for (let i in user_topic_list) {
        let user_id = user_topic_list[i]['user_id'],
          topic_list = user_topic_list[i]['topic_list'],
          form_id_list = user_topic_list[i]['form_id_list'].split(','),
          remind_time = user_topic_list[i]['remind_time'];

        // if (user_id != 'ovMv05WNSF-fzJnoQ4UMSWtMWjFs') continue;

        if (!topic_list || !remind_time) continue;
        // 到user表获取timezone和formid
        dbhelper.select('user', 'timezone',
          'user_id=?', [user_id], '',
          (status, userlist) => {
            if (!status) {
              writeLog('3. 获取用户' + user_id + '的timezone失败');
              return;
            }
            let timezone = userlist[0]['timezone'];

            /** 准备参数 */
            let form_id = '';
            while (form_id_list.length != 0) {
              form_id = form_id_list.pop();
              if (form_id != '') break;
            }
            if (!form_id) {
              writeLog('Oops，该用户' + user_id + '没有可用的form_id了……');
              return;
            }
            // 将pop过的form_id_list重新放入user表中
            if (!form_id) form_id_list = '';
            setFormId(user_id, form_id_list);

            // 计算总共一起参与所有topic的人数
            let total_people_num = 0;
            topic_list = topic_list.split(',');
            for (let i in topic_list)
              total_people_num += topic_use_map[topic_list[i]]


            // 计算时区
            let userCurrentTime = moment();
            if (timezone != '480') { //中国时区，和服务器一致，无须转换
              // 计算用户所在地区现在的时间
              userCurrentTime = moment().utcOffset(parseInt(timezone)).format('YYYY-MM-DD HH:mm');
              // 格式化时间，否则比较时间大小时或出错
              userCurrentTime = moment(userCurrentTime, 'YYYY-MM-DD HH:mm');
            }
            let remindTime = moment(userCurrentTime.format('YYYY-MM-DD ') + remind_time, 'YYYY-MM-DD HH:mm');

            // 如果提醒时间已过，则设置明天提醒
            if (remindTime < userCurrentTime)
              remindTime = moment(userCurrentTime.clone().add(1, 'days').
                format('MM-DD ') + remind_time, 'MM-DD HH:mm');

            // 计算当地时间和用户要被提醒的时间差
            let diffTime = (parseInt(remindTime.diff(userCurrentTime, 'seconds')) + 1) * 1000; //换算成毫秒
            writeLog('给用户' + user_id + '设置了打卡提醒，在' + diffTime + '秒后提醒TA打卡' + topic_list.toString())
            setTimeout(() => {
              writeLog(diffTime / 1000 + '秒计时到啦！准备推送消息给' + user_id);
              /** 推送message */
              messagehelper.sendMessage(user_id, form_id,
                { keyword1: { value: topic_list.toString() }, //打卡项目
                  keyword2: { value: moment().format('YYYY年MM月DD日') }, //打卡时间
                  keyword3: { value: total_people_num }, //参加人数
                  keyword4: { value: perseveranceList[utils.getRandom(0, perseveranceList.length-1)] }, //温馨提示
                },
                (status, errmsg) => {
                  if (status) writeLog('推送消息成功');
                  else {
                    writeLog('推送消息失败，错误原因：');
                    writeLog(errmsg);
                  }
                }
              )
            }, diffTime);
          });
      }
    });


    

    // 这里有个问题，要是同时前端也调用了update form_id，
    // 同时处理一行数据怎么办
    let setFormId = function (user_id, form_id_list) {
      dbhelper.update('user_message', 'form_id_list=?', 'user_id=?',
        [form_id_list.toString() + ',' , user_id],
        (status, errmsg) => {
          if (!status) {
            writeLog('重新update user' + user_id + '的form_id_list失败');
            setFormId(user_id, form_id_list);
          }
          writeLog('重新update user' + user_id + '的form_id_list成功');
        });
    };
  });
};



let sendMessage = function(openid, formid, messageBody, cb){
  messagehelper.sendMessage(openid, formid, messageBody, cb);
  // messagehelper.sendMessage(
  //   'ovMv05WNSF-fzJnoQ4UMSWtMWjFs',
  //   '6a4b10240441483f47fc8e2f433d989b',
  //   {
  //     keyword1: { value: '减肥' }, //打卡项目
  //     keyword2: { value: '2018年8月14日' }, //打卡时间
  //     keyword3: { value: '13' }, //已打卡天数
  //     keyword4: { value: '23' }, //今日排名
  //     keyword5: { value: '55' }, //参加人数
  //     keyword6: { value: '坚持不懈才能积沙成塔喔~' }, //温馨提示
  //   },
  //   (res) => {
  //     if (res) writeLog('推送消息成功');
  //     else writeLog('推送消息失败');
  //   }
  // )
};


/** 开始查看是否有0使用的卡片，删除之 */
function startCheckZeroUseTopic(){
  dbhelper.deleteRow(
    'topic', 'use_people_num=0', [],
    (status, msg) => {
      if (status) writeLog('删除0使用人数的卡片成功')
      else writeLog('删除0使用人数的卡片失败')
    });
}


writeLog('starting....')
startSendMessage()
startCheckZeroUseTopic()


