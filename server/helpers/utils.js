const process = require('child_process');
const RAMDOM_STRING_LENGTH = 20;
const COMMAND_GENERATE_RANDOM_PREFIX = "cat /dev/urandom | LC_CTYPE=C tr -dc '";
const COMMAND_GENERATE_RANDOM_SUFFIX = "' | fold -w " + RAMDOM_STRING_LENGTH + " | head -n 1";

/**
 * 通过ubuntu系统/dev/urandom生成随机数
 */
function generateRandom(cb, range = '0-9a-zA-Z'){
  let command = COMMAND_GENERATE_RANDOM_PREFIX + range + COMMAND_GENERATE_RANDOM_SUFFIX;
  process.exec(command, function (error, stdout, stderr) {
    if (!error) {
      stdout = stdout.replace(/[\r\n]/g, "");
      console.log('随机数：' + stdout);
      cb(stdout);
    }
  });
}

module.exports = {
  generateRandom
};
