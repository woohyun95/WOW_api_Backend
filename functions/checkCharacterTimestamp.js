const mssqlDB = require('../database/knexQuery')
const express = require('express');
const waterfall = require('async').waterfall

function insertTimestamp(characterData,timetable, callback) {
  console.log("===================checkCharacterTimeStamp Start=====================")
  let now = Date.now() / 1000
  if(timetable ==='gear'){
    mssqlDB.insertTable('UpdateTimeTable', {'index': characterData['characterIndex'], 'gear_timestamp': now},(errObj,result)=>{
      if(errObj){
        callback(errObj)
      }else{
        console.log("===================checkCharacterTimestamp End=====================")
        callback(null)
      }
    })
  }else if(timetable ==='progress'){
    mssqlDB.insertTable('UpdateTimeTable', {'index': characterData['characterIndex'], 'progress_timestamp': now},(errObj,result)=>{
      if(errObj){
        callback(errObj)
      }else{
        console.log("===================checkCharacterTimestamp End=====================")
        callback(null)
      }
    })
  }

}

function updateTimestamp(characterData, timetable, callback){
  console.log("===================checkCharacterstamp Start=====================")
  let charData = characterData
  waterfall([
    checkTime,
    updateTime,
  ],function(err,result){
    if(err){
      console.err(err)
    }else{
      console.log("===================checkCharacterstamp End=====================")
      callback(null)
    }
  })

  function checkTime(callback){
    let day = 24 * 60 * 60
    let now = Date.now() / 1000
    if(timetable ==='gear'){
      mssqlDB.selectTable_Condition('UpdateTimeTable', 'index', charData['characterIndex'], (errObj, result) => {
        if (errObj) {
          callback(errObj)
        }
        let timestamp = result[0]['gear_timestamp']
        if (now - timestamp > day) {
          callback(null,false)
        } else {
          callback(null,true)
        }
      })
    }
    else if(timetable ==='progress'){
      mssqlDB.selectTable_Condition('UpdateTimeTable', 'index', charData['characterIndex'], (errObj, result) => {
        if (errObj) {
          callback(errObj)
        }
        let timestamp = result[0]['progress_timestamp']
        if (now - timestamp > day) {
          callback(null,false)
        } else {
          callback(null,true)
        }
      })
    }
  }
  function updateTime(isValid, callback){
    if(!isValid){
      if(timetable === 'gear'){
        mssqlDB.updateTable('UpdateTimeTable', {'index': charData['characterIndex']}, {'gear_timestamp': Math.floor(Date.now() / 1000)})

      }
      else if(timetable==='progress'){
        mssqlDB.updateTable('UpdateTimeTable', {'index': charData['characterIndex']}, {'progress_timestamp': Math.floor(Date.now() / 1000)})

      }
    }
    callback(null)
  }
}

module.exports={
  InsertTimestamp: function(characterData,timestamp,callback){
    insertTimestamp(characterData,timestamp,callback)
  },
  UpdateTimestamp:function(characterData,timestamp,callback){
    updateTimestamp(characterData,timestamp,callback)
  }
}