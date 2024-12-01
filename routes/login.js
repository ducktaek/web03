var express = require('express');
var router = express.Router();
const mysql = require('../mysql/index.js');
const jwt = require('jsonwebtoken');
module.exports = router;
require('dotenv').config({
  path: '.env',
});

// 로그인 성공 시 /home 으로 이동
//토큰 검증
//토큰 검증
verifyToken = (req, res, next) => {
  // 인증 완료
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    // 인증 실패
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    } else {
      return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.',
      });
    }
  }
};

// get 메서드
router.get('/', function (req, res, next) {
  res.render('login', { title: 'login' });
});

// post, /userlogin 로그인
router.post('/userlogin', async (req, res) => {
  try {
    const { id, pw } = req.body;

    const rows = await mysql.query('loginCheck', [id, pw]);
    console.log('login DB Query Result:', rows); // 쿼리 결과 로그

    if (rows.length > 0) {
      const token = jwt.sign(
        {
          id: rows[0].member_id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '5h',
        }
      );

      return res.status(200).json({ loginOk: true, token, message: '로그인 성공' });
    } else {
      res.status(300).json({ loginOk: false, message: '로그인 실패' });
    }
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});
