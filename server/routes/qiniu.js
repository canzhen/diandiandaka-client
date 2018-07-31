var express = require('express');
var qiniuhelper = require('../helpers/qiniuhelper.js');
var router = express.Router();

router.get('/getToken', function (req, res) {
  let token = qiniuhelper.getToken();
  res.send({
    'errorCode': 200,
    'token': token
    });
});

module.exports = router;
