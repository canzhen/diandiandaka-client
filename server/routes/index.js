var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'the test for nodejs session',
    name: 'sessiontest'
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
