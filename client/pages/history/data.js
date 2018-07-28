let checked_data_list = [
  { 'topic': '减肥', 'created_time': '2018-06-03' },
  { 'topic': '减肥', 'created_time': '2018-07-01' },
  { 'topic': '减肥', 'created_time': '2018-07-02' },
  { 'topic': '减肥', 'created_time': '2018-07-03' },
  { 'topic': '减肥', 'created_time': '2018-07-04' },
  { 'topic': '减肥', 'created_time': '2018-07-05' },
  { 'topic': '减肥', 'created_time': '2018-07-06' },
  { 'topic': '减肥', 'created_time': '2018-07-07' },
  { 'topic': '减肥', 'created_time': '2018-07-08' },
  { 'topic': '减肥', 'created_time': '2018-07-09' },
  { 'topic': '减肥', 'created_time': '2018-06-09' },
  { 'topic': '跑步', 'created_time': '2018-06-03' },
  { 'topic': '跑步', 'created_time': '2018-06-13' },
  { 'topic': '跑步', 'created_time': '2018-06-30' },
  { 'topic': '跑步', 'created_time': '2018-06-22' },
  { 'topic': '跑步', 'created_time': '2018-06-11' },
  { 'topic': '跑步', 'created_time': '2018-06-17' },
  { 'topic': '减肥', 'created_time': '2018-06-23' },
  { 'topic': '跑步', 'created_time': '2018-07-07' },
  { 'topic': '跑步', 'created_time': '2018-07-08' },
  { 'topic': '早睡', 'created_time': '2018-07-08' },
  { 'topic': '早睡', 'created_time': '2018-06-12' },
  { 'topic': '早睡', 'created_time': '2018-07-06' },
  { 'topic': '早睡', 'created_time': '2018-07-07' },
  { 'topic': '早睡', 'created_time': '2018-07-08' },
  { 'topic': '早睡', 'created_time': '2018-07-09' },
  { 'topic': '早睡', 'created_time': '2018-07-01' },
  { 'topic': '早睡', 'created_time': '2018-06-01' },
  { 'topic': '清晨一杯水', 'created_time': '2018-06-01' },
  { 'topic': '清晨一杯水', 'created_time': '2018-07-08' },
  { 'topic': '清晨一杯水', 'created_time': '2018-07-09' },
  { 'topic': '吃早餐', 'created_time': '2018-07-01' },
  { 'topic': '吃早餐', 'created_time': '2018-07-03' },
  { 'topic': '健身', 'created_time': '2018-06-01' },
  { 'topic': '健身', 'created_time': '2018-06-11' },
  { 'topic': '阅读', 'created_time': '2018-06-01' },
  { 'topic': '阅读', 'created_time': '2018-06-29' },
  { 'topic': '阅读', 'created_time': '2018-07-02' },];


let topic_info = [ //存该用户所有topic的info，包括image_url（直接数据库调取）和连续打卡天数（经过计算的来）
  { 'name': '减肥', 'image_url': '/images/jianfei.png' },
  { 'name': '跑步', 'image_url': '/images/paobu.png' },
  { 'name': '早睡', 'image_url': '/images/zaoshui.png' },
  { 'name': '清晨一杯水', 'image_url': '/images/qingchenyibeishui.png' },
  { 'name': '吃早餐', 'image_url': '/images/chizaocan.png' },
  { 'name': '健身', 'image_url': '/images/jianshen.png' },
  { 'name': '阅读', 'image_url': '/images/yuedu.png' },];


function getCheckedDataList(){
  return checked_data_list;
}

function getTopicInfo(){
  return topic_info;
}

module.exports = {
  getCheckedDataList,
  getTopicInfo,
}
