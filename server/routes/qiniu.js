var express = require('express');
var qiniuhelper = require('../helpers/qiniuhelper.js');
var router = express.Router();

router.get('/getToken', function (req, res) {
  res.send({
    'status': 0,
    'token': qiniuhelper.getToken()
    });
});

module.exports = router;
