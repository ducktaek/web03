var express = require('express');
var router = express.Router();
const mysql = require('../mysql/index.js');

module.exports = router;

// get 메서드
router.get('/', function (req, res, next) {
  res.render('register', { title: 'register' });
});

// ID 중복 확인

router.post('/checkid', async (req, res) => {
  try {
    const id = req.body.id;
    console.log('Received ID for checking:', id); // ID 값 확인

    if (!id) {
      return res.status(400).json({ error: 'ID가 전달되지 않았습니다.' });
    }

    // member 테이블의 member_id 컬럼에서 아이디 확인

    const rows = await mysql.query('idCheck', req.body.id);

    console.log('DB Query Result:', rows); // 쿼리 결과 로그

    if (rows.length > 0) {
      res.json({ available: false, message: '이미 사용 중인 아이디에요' });
    } else {
      res.json({ available: true, message: '백엔드) 사용 가능한 아이디에요' });
    }
  } catch (error) {
    console.error('아이디 확인 중 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 생성
router.post('/makeuser', async (req, res) => {
  try {
    const user = { member_id: req.body.id, pwd: req.body.pw, name: req.body.name };

    await mysql.query('memberInsert', user);

    res.status(200).json({ message: '회원가입 성공' });
  } catch (error) {
    console.log('유저 생성 오류:', error);
    res.status(500).json({ error: '서버 오류, 유저 생성 오류' });
  }
});

// var express = require('express');
// var router = express.Router();
// const mysql = require('../mysql/index.js');

// module.exports = router;

// // get 메서드
// router.get('/', function (req, res, next) {
//   res.render('register', { title: 'register' });
// });

// router.post('/checkid', async (req, res) => {
//   try {
//     const id = req.body.id;
//     // MySQL 쿼리를 사용하여 사용자 아이디 확인

//     const [rows] = await mysql.query('SELECT * FROM member WHERE id = ?', [id]);

//     if (rows.length > 0) {
//       res.json({ available: false, message: '이미 사용 중인 아이디에요' });
//     } else {
//       res.json({ available: true, message: '사용 가능한 아이디에요' });
//     }
//   } catch (error) {
//     console.error('아이디 확인 중 오류:', error);
//     res.status(500).json({ error: '서버 오류' });
//   }
// });

// //post, /makeuser user객체생성
// router.post('/makeuser', async (req, res) => {
//   try {
//     const result = await mysql.query('customerInsert', req.body.param);
//     res.send(result);
//   } catch (error) {
//     console.log('유저 생성오류');
//     res.status(500).json({ error: '서버오류, 유저생성오류' });
//   }
// });
