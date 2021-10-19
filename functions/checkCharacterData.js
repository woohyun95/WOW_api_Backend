const mssqlDB = require('../database/knexQuery')

function checkDatabase(characterData,callback) {//1단계 캐릭터db가 존재하는지 확인 및 업데이트
  console.log("===================checkCharacterData Start=====================")
  mssqlDB.selectTable_Condition('UserIndex','Name',characterData['characterName'],(errObj,data)=>{
    if(errObj){
      callback(errObj)
    }else{
      if(data[0]){//데이터 있음
        console.log("===================checkCharacterData End=====================")
        callback(null,true)
      }else{//데이터 없음
        console.log("===================checkCharacterData End=====================")
        callback(null,false)
      }
    }
  })
}

module.exports ={
  checkCharacterDatabase:function(characterData,callback) {
    checkDatabase(characterData,callback);
  }
}