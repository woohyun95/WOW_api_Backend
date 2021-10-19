const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(bToken())
  res.render('index', { title: 'api test backend' });
});

module.exports = router;

// 유저별 정보
// 게임 정보 <- 이미지 정보 // 아이템 정보 <- <- 관리자가 업데이트
// db 저장
// api 따로 호출해주면 그때 정보를 refresh 시키면 됨
// db에 저장
// 연결된 서버들이 그 데이터를 다시 업데이트
// 백엔드 서버가 여러개 떠있음
// 하나의 db에 연결돼 있음
// 디비 업데이트하는 api 를 마스터 서버에 날림
// 마스터 서버가 디비를 업데이트 함
// 나머지 서버가 디비에서 정보를 가져와서 자기 메모리에 신규 데이터를 적재함