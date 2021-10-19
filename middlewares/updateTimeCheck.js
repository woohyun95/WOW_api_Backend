const knexQuery = require("../database/knexQuery.js");

function updateTimeCheck(req,res,next){
  let body
  try {
    body = JSON.parse(JSON.stringify(req.body))
  } catch (e) {
    res.send('error')
  }
  let characterName = body['characterName']
  let realm = body['serverList']
  //let region =body['region']
  next()
}

module.exports = updateTimeCheck
/*
1. 현재 클라이언트에서 넘어온 데이터가 DB에 등록되어있는지 확인한다.

2-1. (있다면) DB에 등록된 데이터의 UpdateTime을 확인한다.
	2-1-1. UpdateTime이 limit 초과했을 경우 새로운 데이터로 갱신한다. -> getchardata 실행
	2-1-2. 유효한 상태인 경우 이미 등록된 데이터를 가져온다.

2-2. (없다면) DB에 새 데이터를 등록한다. -> getchardata 실행

아이디 유효성 검사 끝나고 나서 실행해야함.

 */