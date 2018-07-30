const redis = require('redis');
const {redis: config} = require('../config.js');
const client = redis.createClient(config);
redis.client = client;
/**
 * 存数据
 * @param key: 键
 * @param value: 值
 */
function storeValue(key, value) {
  console.log('save redis, key: ' + key + ', value: ' + value);
  client.set(key, value);
}



/**
 * 取数据
 * @param key: 要查找的键
 * @param cb: 回调函数
 */
function getValue(key, cb) {
  client.get(key, function (err, object) {
    if (err){
      console.log('get key ' + key + ' failed');
      return;
    }
    if (object){
      console.log('get redis ' + key + ' value');
      console.log(object);
      console.log('err:');
      console.log(err);
      cb(object);
    }else cb(false);
  })
}



module.exports = {
  storeValue,
  getValue
};
