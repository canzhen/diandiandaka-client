const config = require('./config.js');
const dbhelper = require('./helpers/dbhelper.js');
const messagehelper = require('./helpers/messagehelper.js');
// const moment_timezone = require('moment-timezone');
const moment = require('moment');


console.log(moment().utcOffset(480).inspect())

function start(){

  // 遍历user_message表 
  dbhelper.select('user_message', '', '', [], '',
  (status, result) => {
    console.log(status);
    console.log(result);
  });

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



// dbhelper.update('user', 'user_name=?', 'user_id=?',
//   [Math.random() + '', 'ovMv05WNSF-fzJnoQ4UMSWtMWjFs'],
//   (status, result) => {
//     console.log(status)
//     console.log(result);
//     if (status) console.log('任务执行成功')
//     else console.log('任务执行失败')
//   });
};

console.log('starting....')
start()