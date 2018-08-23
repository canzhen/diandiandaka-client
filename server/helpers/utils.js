const process = require('child_process');
const RAMDOM_STRING_LENGTH = 20;
const COMMAND_GENERATE_RANDOM_PREFIX = "cat /dev/urandom | LC_CTYPE=C tr -dc '";
const COMMAND_GENERATE_RANDOM_SUFFIX = "' | fold -w " + RAMDOM_STRING_LENGTH + " | head -n 1";

/**
 * 通过ubuntu系统/dev/urandom生成随机数
 */
module.exports.generateRandom = function(cb, range = '0-9a-zA-Z'){
  let command = COMMAND_GENERATE_RANDOM_PREFIX + range + COMMAND_GENERATE_RANDOM_SUFFIX;
  process.exec(command, function (error, stdout, stderr) {
    if (!error) {
      stdout = stdout.replace(/[\r\n]/g, "");
      console.log('随机数：' + stdout);
      cb(stdout);
    }
  });
}


/**
 * 低级的生成随机数方法，参数为随机数的最小值和最大值
 * 范围：[min, max] 都是闭集
 */
module.exports.getRandom = function (min, max) {
  // var seed = today.getTime();
  // seed = (seed * 9301 + 49297) % 233280;
  var Range = max - min;
  var Rand = Math.random();
  return (min + Math.round(Rand * Range));
}