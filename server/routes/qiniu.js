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

/**
 * 删除云端的图片
 */
router.post('/delete', function (req, res) {
  let key = req.body.key;
  qiniuhelper.deleteImage(key, (result, errmsg) => {
    if (result) res.send({'error_code' : 200, 'msg': ''});
    else res.send({ 'error_code': 100, 'msg': errmsg });
  });
});

module.exports = router;
