var express = require('express');
var router = express.Router();

// 초기 페이지
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// 임시 테스트를 위한 room 으로 연결
module.exports = router;

// 초기 페이지
router.get('/room', function (req, res, next) {
  res.render('room', { title: 'room' });
});

// 임시 테스트를 위한 room 으로 연결
module.exports = router;
