const {sms:config} = require('../config.js');
const QcloudSms = require("qcloudsms_js");
// 短信应用SDK AppID
let appid = config.AppID;  // SDK AppID是1400开头
// 短信应用SDK AppKey
let appkey = config.AppKey;
// 短信模板ID，需要在短信应用中申请
let templateId = config.templateId;
let templateIdCombine = config.templateIdCombine;
// 签名
let smsSign = "周灿桢不负此生";
// 实例化QcloudSms
let qcloudsms = QcloudSms(appid, appkey);


function sendSMS(params, countryCode, phoneNumber, isCombine, cb){
  let ssender = qcloudsms.SmsSingleSender();
  console.log('countryCode:' + countryCode)
  console.log('phoneNumber:' + phoneNumber)
  ssender.sendWithParam(countryCode, phoneNumber, 
            isCombine ? templateIdCombine : templateId,params, 
            smsSign, "", "", cb);
}

module.exports = {
  sendSMS
};
