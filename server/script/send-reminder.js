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
  /**
   * 遍历usertopic表
   */
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



  /**
   * 获取topic使用人数信息
   */
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


  /**
   * 获取用户信息
   */
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




  /**
   * 正式开始执行
   */
  getAllFromUserTopic().then((user_topic_list) => {
    return getTopicUseMap(user_topic_list)
  }).then(([user_topic_list, topic_use_map]) => {
    return getUserMap(user_topic_list, topic_use_map)
  }).then(([user_topic_list, topic_use_map, user_map]) => {
    let combineTopicMap = {};
    // 循环开始
    for (let i in user_topic_list) {
      let user_id = user_topic_list[i]['user_id'],
          timezone = user_map[user_id]['timezone'],
          topic = user_topic_list[i]['topic_name'],
          rank = user_topic_list[i]['rank'],
          total_day = user_topic_list[i]['total_day'],
          complete_rate = user_topic_list[i]['complete_rate'],
          end_date = user_topic_list[i]['end_date'],
          remind_time = user_topic_list[i]['remind_time'],
          remind_method = user_topic_list[i]['remind_method'],
          remind_group = user_topic_list[i]['remind_group'],
          last_check_time = user_topic_list[i]['last_check_time'],
          force_remind = false; //用户没设置提醒，自作主张提醒（超过五天没打卡）



      if (user_id != 'ovMv05WNSF-fzJnoQ4UMSWtMWjFs') continue;

      console.log(topic);

      if (end_date != '永不结束' && moment() >
        moment(end_date, 'YYYY-MM-DD')) continue;

      // 如果已经五天没打卡了，即使用户没设置提醒仍要提醒用户
      if (!remind_time){
        if (moment().diff(moment(last_check_time, 'YYYY-MM-DD'),
          'days') <= 5) continue;
        // 没设置提醒，却已经五天没打卡了，就要强制提醒
        else {
          force_remind = true;
          console.log('强制给用户' + user_id + '推送提醒，因为已经五天没打卡了');
        }
      } 





      if (remind_group != -1 || force_remind){
        if (combineTopicMap[remind_group] == undefined)
          combineTopicMap[remind_group] = { topic: [] }
        combineTopicMap[remind_group].topic.push(topic);
        combineTopicMap[remind_group].user_id = user_id;
        combineTopicMap[remind_group].remind_time = remind_time;
        combineTopicMap[remind_group].remind_method = remind_method;
        combineTopicMap[remind_group].timezone = timezone;
        continue;
      }


      let diffTime = getDiffSeconds(user_id, topic, timezone, remind_time, remind_method);


      /** 微信推送 */
      if (remind_method == 1){ //强制推送是通过微信
        // 准备form_id
        let form_id = getFormId(user_id, user_map);
        if (!form_id) continue;

        // 开始设置提醒
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【微信】推送消息给' + user_id + '，推送使用的的form_id为：' + form_id);
          let words = perseveranceList[utils.
            getRandom(0, perseveranceList.length - 1)];
          /** 推送message */
          messagehelper.sendMessage(user_id, form_id,
            {
              keyword1: { value: topic }, //打卡项目
              keyword2: { value: moment().
                          format('YYYY年MM月DD日') }, //打卡时间
              keyword3: { value: total_day }, //已打卡天数
              keyword4: { value: complete_rate + '%'}, //进度
              keyword5: { value: rank == -1 ? 
                          topic_use_map[topic]: rank }, //今日排名
              keyword6: { value: topic_use_map[topic] }, //参加人数
              keyword7: { value: words}, //提示语
            }, false, //单独发送
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
                      complete_rate + '%', 
                      rank == -1 ? topic_use_map[topic] : rank ,
                      '人生在勤，不索何获。']

        /* 开始设置提醒 */
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【短信】推送消息给' + user_id);
          smshelper.sendSMS(params, countryCode, phone, false,
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
    // 循环发送单独提醒结束








    /**
     * 处理统一发送的卡片
     */
    for (let i in combineTopicMap){

      let diffTime = getDiffSeconds(combineTopicMap[i].user_id,
                          combineTopicMap[i].topic.toString(),
                          combineTopicMap[i].timezone, 
                          combineTopicMap[i].remind_time,
                          combineTopicMap[i].remind_method);
      
      if (combineTopicMap[i].remind_method == 1){

        let form_id = getFormId(combineTopicMap[i].user_id, user_map);
        if (!form_id) continue;
        /* 开始设置提醒 */
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【微信】推送消息给' + combineTopicMap[i].user_id + '，推送使用的的form_id为：' + form_id);
          let words = force_remind ? 
            '你已经超过五天没有打卡了喔，卡卡好想你呀~': 
            perseveranceList[utils.getRandom(0, 
                perseveranceList.length - 1)];
          /** 推送message */
          messagehelper.sendMessage(combineTopicMap[i].user_id, form_id,
            {
              keyword1: { value: combineTopicMap[i].topic.toString() }, //打卡项目
              keyword2: { value: moment().format('YYYY年MM月DD日') }, //打卡时间
              keyword3: { value: words }, //提示语
            }, true, //合并发送
            (status, errmsg) => {
              if (status) writeLog('推送消息成功');
              else {
                writeLog('推送消息失败，错误原因：');
                writeLog(errmsg);
              }
            }
          )
        }, diffTime);

      }else{

        let phone_number = user_map[combineTopicMap[i].user_id]['phone_number'];
        let countryCode = phone_number.split('-')[0],
          phone = phone_number.split('-')[1];
        let params = [combineTopicMap[i].remind_time, 
          "「" + combineTopicMap[i].topic.toString() + "」",
          '人生在勤，不索何获。']

        /* 开始设置提醒 */
        setTimeout(() => {
          writeLog(diffTime / 1000 + '秒计时到啦！准备【短信】推送消息给' + combineTopicMap[i].user_id);
          smshelper.sendSMS(params, countryCode, phone, true,
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


    process.exit(0);

  })




  /**
   * 计算当前时间到提醒时间之间的时间差（以秒为单位）
   */
  let getDiffSeconds = function (user_id, topic, timezone,
    remind_time, remind_method) {

    if (!remind_time) return 0; //如果没有设置提醒时间，那么直接提醒

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
    writeLog('给用户' + user_id + '设置了' + method + '打卡提醒，' +
      '提醒时间为：' + remindTime.format('YYYY-MM-DD HH:mm') +
      '，在' + diffTime / 1000 + '秒后提醒TA打卡【' + topic + '】')

    return diffTime;
  }




  /**
   * 获取form_id
   */
  let getFormId = function (user_id, user_map) {
    let form_id_str = user_map[user_id]['form_id_list'];
    if (!form_id_str || form_id_str.indexOf(',') == -1) {
      writeLog('Oops，该用户' + user_id + '没有可用的form_id了……');
      return false;
    }
    let form_id_list = form_id_str.split(',');

    let form_id = '';
    while (form_id_list.length != 0) {
      form_id = form_id_list.pop();
      if (form_id != '') break;
    }
    if (!form_id) {
      writeLog('Oops，该用户' + user_id + '没有可用的form_id了……');
      return false;
    }

    // 将pop过的form_id_list重新放入user表中
    if (!form_id) form_id_list = '';

    // 这里有个问题，要是同时前端也调用了update form_id，
    // 同时处理一行数据怎么办
    dbhelper.update('user', 'form_id_list=?', 'user_id=?',
      [form_id_list.toString() + ',', user_id],
      (status, errmsg) => {
        if (!status) {
          writeLog('重新update user ' + user_id + '的form_id_list失败');
          setFormId(user_id, form_id_list, user_map);
        }
        writeLog('重新update user ' + user_id + '的form_id_list成功');
      });
    user_map[user_id]['form_id_list'] = form_id_list.toString() + ',';

    return form_id;
  }
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

