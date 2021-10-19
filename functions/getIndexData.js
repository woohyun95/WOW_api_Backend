const mssqlDB = require('../database/knexQuery')
const express = require('express');
const waterfall = require('async').waterfall

function registerNewData(characterData,callback){
  console.log("===================getIndexData start=====================")
  let charData = characterData
  waterfall([
    getRealmIndex,
    getRegionIndex,
    updateCharacterDB,
    getCharacterIndex,
    createGearDB,
    createProgressDB
    ]
    ,function (err,result) {
    if(err){
      console.error(err)
    }else{
      charData['isRegistered'] =false;
      console.log("===================getIndexData end=====================")
      callback(null,charData)
    }
  })
  function getRealmIndex(callback){
    mssqlDB.selectTable_Condition('Realms', 'realm', charData['realm'], (errObj, data) => {
      if (errObj) {
        callback(errObj)
      } else {
        charData['realmIndex'] = data[0]['id']
        callback(null)
      }
    })
  }

  function getRegionIndex(callback){
    mssqlDB.selectTable_Condition('region', 'region', charData['region'], (errObj, data) => {
      if (errObj) {
        callback(errObj)
      } else {
        charData['regionIndex'] = data[0]['id']
        callback(null)
      }
    })
  }

  function updateCharacterDB(callback){
      mssqlDB.insertTable('UserIndex', {Name: charData['characterName'], Realm: charData['realmIndex'], Region: charData['regionIndex']},(errObj,result)=>{
        if(errObj){
          callback(errObj)
        }else{
          callback(null)
        }
      })
  }

  function createGearDB(callback){
    mssqlDB.insertTable('CharacterGearData',{index:charData['characterIndex'], gearData:" "},(errObj,result)=>{
      if(errObj){
        callback(errObj)
      }else{
        callback(null)
      }
    })
  }
  function createProgressDB(callback){
    mssqlDB.insertTable('CharacterProgressData',{index:charData['characterIndex'], progressData:" "},(errObj,result)=>{
      if(errObj){
        callback(errObj)
      }else{
        callback(null)
      }
    })
  }
  function getCharacterIndex(callback) {
    mssqlDB.selectTable_Condition('UserIndex', 'Name', charData['characterName'], (errObj, result) => {
      if (errObj) {
        callback(errObj)
      } else {
        charData['characterIndex'] = result[0]['index']
        callback(null)
      }
    })
  }
}

function getExistingData(characterData,callback){
  let charData = characterData
  mssqlDB.selectTable_Condition('UserIndex', 'Name', charData['characterName'], (errObj, result) => {
    if (errObj) {
      callback(errObj)
    } else {
      charData['isRegistered'] = true
      charData['regionIndex'] = result[0]['Region']
      charData['realmIndex'] = result[0]['Realm']
      charData['characterIndex'] = result[0]['index']
      callback(null,charData)
    }
  })
}

module.exports={
  RegisterNewData: function(characterData,callback){
    registerNewData(characterData,callback)
  },
  GetExistingData: function(characterData,callback){
    getExistingData(characterData,callback)
  }
}

//route folder request response