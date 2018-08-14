const express = require('express');
const request = require('request');
const config = require('../../config.js');
const router = express.Router();

/* get access token */
router.get('/getAccessToken', function (req, res) {
  console.log('getAccessToken')
  request({
    'url': config.getAccessTokenUrl,
    'method': 'GET',
    'qs': {
      appid: config.appId,
      secret: config.appSecret,
      grant_type: 'client_credential'
    },
    'json': true
  }, (error, response, body) => {
    console.log(error)
    if (!error && response.statusCode == 200) {
      req.send({'error_code': 200, 'msg': '', 'result': body});
    } else {
      req.send({ 'error_code': 100, 'msg': error, 'result': [] });
    }
  });
});



module.exports = router;
