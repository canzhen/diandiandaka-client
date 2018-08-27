const dbhelper = require('../helpers/dbhelper.js');
const messagehelper = require('../helpers/messagehelper.js');
const smshelper = require('../helpers/smshelper.js')
const utils = require('../helpers/utils.js');
const moment = require('moment');
const Promise = require('promise');


const perseveranceList = [
'坚持不懈才能积沙成塔', 
'人生在勤，不索何获。',
'流水不腐，户枢不蠹，民生在勤。',
'勤学如春起之苗，不见其增，日有所长。',
'业精于勤而荒于嬉，行成于思而毁于随。',
'不经一番寒彻骨，怎得梅花扑鼻香？',
'契而舍之，朽木不折；契而不舍，金石可偻。',
'一日一钱，十日十钱。绳锯木断，水滴石穿。',
'合抱之木，生于毫末；九层之台，起于垒土；千里之行，始于足下。', ,
'苟有恒，何必三更起五更眠；最无益，只怕一日曝十日寒。',
'盛年不再来，一日难再晨，及时当勉励，岁月不待人。'];

// /** 模拟阻塞方法 */
// function sleep(milliSeconds) {
//   var startTime = new Date().getTime();
//   while (new Date().getTime() < startTime + milliSeconds);
// }

function writeLog(log){
  console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] ' + log);
}

/** 开始发送消息 */
function startSendMessage() { 

  let getAllFromUserTopic = function(){
    return new Promise((resolve) => {
      /** 遍历user_topic表 */
      dbhelper.select('user_topic', '', '', [], '',
        (status, result) => {
          if (!status) {
            writeLog('1. 遍历user_topic表失败');
            return;
          }
          if (result.length == 0) return;
          resolve(result);
        });
    })
  }


  let getTopicUseMap = function (user_topic_list){
    return new Promise((resolve) => {
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

          resolve([user_topic_list, topic_use_map])
        })
    })
  }


  let getUserMap = function(user_topic_list, topic_use_map) {
    return new Promise((resolve) => {
      let user_map = {};

      dbhelper.select('user', 
        'user_id, timezone, form_id_list, phone_number', 
        '', [], '',
        (status, result) => {
          if (!status) {
            writeLog('3. 获取所有user的timezone和form_id_list失败');
          }
          // 生成user_map
          for (let i in result) {
            user_map[result[i]['user_id']] = {
              timezone: result[i]['timezone'],
              form_id_list: result[i]['form_id_list'],
              phone_number: result[i]['phone_number']
            }
          }
          resolve([user_topic_list, topic_use_map, user_map])
        })
    })
  }




  getAllFromUserTopic().then((user_topic_list) => {
    return getTopicUseMap(user_topic_list)
  }).then(([user_topic_list, topic_use_map]) => {
    return getUserMap(user_topic_list, topic_use_map)
  }).then(([user_topic_list, topic_use_map, user_map]) => {

    for (let i in user_topic_list) {
      /** 获取form_id和timezone */
      let user_id = user_topic_list[i]['user_id'];
      let form_id_str = user_map[user_id]['form_id_list'],
        timezone = user_map[user_id]['timezone'];
      if (!form_id_str || form_id_str.indexOf(',') == -1) {
        writeLog('Oops，该用户' + user_id + '没有可用的form_id了……');
        continue;
      }
      let form_id_list = form_id_str.split(',');

      let topic = user_topic_list[i]['topic_name'],
          rank = user_topic_list[i]['rank'],
          total_day = user_topic_list[i]['total_day'],
          complete_rate = user_topic_list[i]['complete_rate'],
          remind_method = user_topic_list[i]['remind_method'],
          remind_time = user_topic_list[i]['remind_time'];

      if (remind_method == -1 || !remind_time) continue;
      if (user_id != 'ovMv05V0Ac7Yib5g1TGAH95HC5XQ') continue;

      /* 计算时区 */
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


      /* 计算当地时间和用户要被提醒的时间差 */
      let diffTime = (parseInt(remindTime.diff(userCurrentTime, 'seconds')) + 1) * 1000; //换算成毫秒
      let method = remind_method == 1 ? '【微信】' : '【短信】';
      writeLog('给用户' + user_id + '设置了' + method + '打卡提醒，在' + diffTime + '秒后提醒TA打卡【' + topic + '】')




      /** 微信推送 */
      if (remind_method == 1){
        /** 准备form_id */
        let form_id = '';
        while (form_id_list.length != 0) {
          form_id = form_id_list.pop();
          if (form_id != '') break;
        }
        if (!form_id) {
          writeLog('Oops，该用户' + user_id + '没有可用的form_id了……');
          continue;
        }

        // 将pop过的form_id_list重新放入user表中
        if (!form_id) form_id_list = '';
        setFormId(user_id, form_id_list, user_map);


        /* 开始设置提醒 */
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【微信】推送消息给' + user_id + '，推送使用的的form_id为：' + form_id);
          /** 推送message */
          messagehelper.sendMessage(user_id, form_id,
            {
              keyword1: { value: topic }, //打卡项目
              keyword2: { value: moment().format('YYYY年MM月DD日') }, //打卡时间
              keyword3: { value: total_day }, //已打卡天数
              keyword4: { value: complete_rate + '%'}, //进度
              keyword5: { value: rank }, //今日排名
              keyword6: { value: topic_use_map[topic] }, //参加人数
              keyword7: { value: perseveranceList[utils.getRandom(0, perseveranceList.length - 1)] }, //提示语
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
        
      } else if (remind_method == 2) {
        let phone_number = user_map[user_id]['phone_number'];
        let countryCode = phone_number.split('-')[0],
            phone = phone_number.split('-')[1];
        let params = [remind_time, "「" + topic + "」", 
              complete_rate + '%', rank,'人生在勤，不索何获。']

        /* 开始设置提醒 */
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【短信】推送消息给' + user_id);
          smshelper.sendSMS(params, countryCode, phone,
            (err, res, resData) => {
              if (err) {
                writeLog('发送短信失败：', err);
              } else {
                writeLog('发送短信成功！');
                writeLog("request data: ", res.req);
                writeLog("response data: ", resData);
              }
            });
        }, diffTime)
      }
    }

  })



  // 这里有个问题，要是同时前端也调用了update form_id，
  // 同时处理一行数据怎么办
  let setFormId = function (user_id, form_id_list, user_map) {
    dbhelper.update('user', 'form_id_list=?', 'user_id=?',
      [form_id_list.toString() + ',' , user_id],
      (status, errmsg) => {
        if (!status) {
          writeLog('重新update user ' + user_id + '的form_id_list失败');
          setFormId(user_id, form_id_list, user_map);
        }
        writeLog('重新update user ' + user_id + '的form_id_list成功');
      });
    user_map[user_id]['form_id_list'] = form_id_list.toString() + ',';  
  };
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


