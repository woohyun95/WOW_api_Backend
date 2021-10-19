function characterLevelEvaluation(charLevel) {
  if (isNaN(charLevel)) return false
  let num = Number(charLevel)
  if(!Number.isInteger(num)) return false
  return !(charLevel < 2 || charLevel > 60);
}

module.exports = characterLevelEvaluation

// 클라에서 한번 걸러줘야 함 -> 클라 자원을 쓰는것이기 때문에 클라에서 밸리데이션 무적권.. -> 서버 자원을 덜 쓰기 위해
// 서버에서는 더 엄격하게  -> web api -> 정해진 클라이언트를 안써도 api 접근이 됨. -> 서버 터지는걸 막는것