const knexQuery = require('./knexQuery')
const waterfall = require('async/waterfall.js')

let regionTable=[]
let localeTable=[]
let realmTable=[]

let regionList = []
let localeList = []
let realmList = []

function getUserConfigData(){

  waterfall([
    getRegionTable,
    getLocaleTable,
    getRealmTable
  ],function(err,result){
  })

  function getRegionTable(callback) {
    knexQuery.selectTable('Region',(errObj,data)=>{
      if(errObj){
        callback(errObj)
      }else{
        regionTable = data
        regionTable.forEach(data=>{
          regionList.push(data['region'])
        })
        callback(null)
      }
    })
  }

  function getLocaleTable(callback){
    knexQuery.selectTable('Locale',(errObj,data)=>{
      if(errObj){
        callback(errObj)
      }else{
        localeTable = data
        localeTable.forEach(data=>{
          localeList.push(data['locale'])
        })
        callback(null)
      }
    })
  }

  function getRealmTable(callback){
    knexQuery.selectTable('Realms',(errObj,data)=>{
      if(errObj){
        callback(errObj)
      }else{
        realmTable = data
        realmTable.forEach(data=>{
          realmList.push(data['realm'])
        })
        callback(null)
      }
    })
  }
}

getUserConfigData()

module.exports = {
  getRealmTable: function(){
    return realmTable
  },
  getLocaleTable: function(){
    return localeTable
  },
  getRegionTable: function(){
    return regionTable
  },
  getRealmList: function(){
    return realmList
  },
  getLocaleList: function(){
    return localeList
  },
  getRegionList: function(){
    return regionList
  }
}