const express = require('express');
const router = express.Router();
const { rooms, createRoom, joinRoom } = require('../modules/roomManager'); // 방 관리 로직 분리

// 홈 페이지 렌더링
router.get('/', (req, res) => {
  res.render('home', { title: 'home' });
});

// 방 목록 제공
router.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

module.exports = router;
