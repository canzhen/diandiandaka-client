var express = require('express');
var qiniuhelper = require('../helpers/qiniuhelper.js');
var router = express.Router();

router.get('/getToken', function (req, res) {
  let token = qiniuhelper.getToken();
  res.send({
    'error_code': 200,
    'token': token
    });
});

module.exports = router;
