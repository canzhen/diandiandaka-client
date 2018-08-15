const config = require('./config.js');
const dbhelper = require('./helpers/dbhelper.js');
const messagehelper = require('./helpers/messagehelper.js');
const moment = require('moment');


/** 模拟阻塞方法 */
function sleep(milliSeconds) {
  var startTime = new Date().getTime();
  while (new Date().getTime() < startTime + milliSeconds);
};

// console.log(moment().utcOffset(480).inspect())

/** 脚本开始运行 */
function start(){
  /** 遍历user_message表 */ 
  dbhelper.select('user_message', '', '', [], '',
  (status, result) => {
    if (!status){
      console.log('1. 遍历user_message表失败');
      return;
    }
    if (result.length == 0) return;
    let user_topic_list = result;
    let topic_use_map = {};

    /* 获取所有topic的使用人数，生成topic_use_map */
    dbhelper.select('topic', 'topic_name, use_people_num', '', [], '',
    (status, result) => {
      if (!status) {
        console.log('2. 获取所有topic的使用人数失败');
      }
      // 生成topic_use_map
      for (let i in result) {
        topic_use_map[result[i]['topic_name']] =
          result[i]['use_people_num'];
      }


      /* 遍历user_topic_list，给每个user的每个topic发送通知 */
      for (let i in user_topic_list) {
        let user_id = user_topic_list[i]['user_id'],
          topic_list = user_topic_list[i]['topic_list'].split(','),
          remind_time = user_topic_list[i]['remind_time'];

        if (!topic_list) continue;

        // 到user表获取timezone和formid
        dbhelper.select('user', 'timezone, form_id_list',
          'user_id=?', [user_id], '',
          (status, userlist) => {
            if (!status) {
              console.log('3. 获取用户' + user_id + '的formid失败');
              return;
            }
            let timezone = userlist[0]['timezone'],
              form_id_list = userlist[0]['form_id_list'];

            /** 准备参数 */
            // 从string分割成form_id_list
            form_id_list = form_id_list.split(',');
            let form_id = '';
            while (form_id_list.length != 0) {
              form_id = form_id_list.pop();
              if (form_id != '') break;
            }
            // if (!form_id) {
            //   console.log('Oops，该用户没有可用的form_id了……');
            //   return;
            // }
            // 将pop过的form_id_list重新放入user表中
            if (!form_id) form_id_list = '';
            setFormId(user_id, form_id_list);

            // 计算总共一起参与所有topic的人数
            let total_people_num = 0;
            console.log(topic_use_map['写五个自己的优点'])
            for (let i in topic_list) {
              console.log(topic_list[i])
              console.log(topic_use_map[topic_list[i]])
              total_people_num += topic_use_map[topic_list[i]];
            }

            console.log(total_people_num)

            // 计算时区
            let userCurrentTime = moment();
            let remindTime = moment(remind_time, 'HH:mm');
            if (remind_time != '480') { //中国时区，和服务器一致，无须转换
              // 计算用户所在地区现在的时间
              userCurrentTime = moment().utcOffset(parseInt(remind_time));
            }
            // 如果提醒时间已过，则设置明天提醒
            if (remindTime < userCurrentTime)
              remindTime = moment(userCurrentTime.clone().add(1, 'days').
                format('MM-DD ') + remind_time, 'MM-DD HH:mm');
            // 计算当地时间和用户要被提醒的时间差
            let diffTime = parseInt(remindTime.diff(userCurrentTime, 'seconds')) * 1000; //换算成毫秒
            console.log(diffTime)
            setTimeout(() => {
              console.log(diffTime / 1000 + '秒计时到啦！准备推送消息给' + user_id);
              /** 推送message */
              // messagehelper.sendMessage(user_id, form_id,
              //   {
              //     keyword1: { value:  }, //打卡项目
              //     keyword2: { value: '2018年8月14日' }, //打卡时间
              //     keyword3: { value: '13' }, //已打卡天数
              //     keyword4: { value: '23' }, //今日排名
              //     keyword5: { value: '55' }, //参加人数
              //     keyword6: { value: '坚持不懈才能积沙成塔喔~' }, //温馨提示
              //   },
              //   (res) => {
              //     if (res) console.log('推送消息成功');
              //     else console.log('推送消息失败');
              //   }
              // )
            }, diffTime);
          });
      }
    });


    

    // 这里有个问题，要是同时前端也调用了update form_id，
    // 同时处理一行数据怎么办
    let setFormId = function (user_id, form_id_list) {
      dbhelper.update('user', 'form_id_list=?', 'user_id=?',
        [form_id_list.toString(), user_id],
        (status, errmsg) => {
          if (!status) {
            console.log('重新update user' + user_id + '的form_id_list失败');
            setFormId(user_id, form_id_list);
          }
          console.log('重新update user' + user_id + '的form_id_list成功');
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
  //     if (res) console.log('推送消息成功');
  //     else console.log('推送消息失败');
  //   }
  // )
};


console.log('starting....')
start()