const cm = require('../functions/common')
const waterfall = require('async').waterfall
const request = require('request')
const knexConfiguration = {
  client: 'mssql',
  connection: {
    user: 'testLogin',
    password: '15243qtwre!1',
    server: 'localhost',
    database: 'woohyun',
    port: 63123,
  }
}
const knex = require('knex')(knexConfiguration)

//Insert('test',{'hello':'bye','hi':'ayaya'})
//Insert('test',{'hi':'ayaya'})
//Update('test',{'hi':'this is update test'} ,{'hello':'this is update test'})
//Delete('test','hello','bye')
/*
waterfall([
  getToken,
  getServerList,
], function(err,result){
  console.log('this is waterfall result')
  console.log(result)
  result['realms'].forEach(server=>{
    let serverData = {'id':server['id'],'Realm':server['slug']}
    Insert('Realms',serverData)
    Select('Realms')
  })
})
function getToken(callback) {
  let data ={}
  const options = {
    uri: 'https://us.battle.net/oauth/token',
    method: 'POST',
    form: {
      client_id: '9691cab201a64a55a363e93a70101f3f',
      client_secret: 'z2lEfgtXze8F1Dp6iMZGAmv4gYv6cgKm',
      grant_type: 'client_credentials'
    }
  }
  request.post(options, function (err, httpsResponse, body) {
    let token = JSON.parse(body)['access_token']
    global.bToken = function(){
      return token
    }
    Object.assign(data, cm.addSubObj('token',token))
    callback(null, data)
  })
}
function getServerList(data,callback){
  console.log('this is serverLists callback data')
  console.log(data)
  let result = {}
  const options = {
    uri:'https://kr.api.blizzard.com/data/wow/realm/index',
    qs:{
      region: 'kr',
      namespace: 'dynamic-kr',
      locale: 'ko-KR',
      access_token: bToken()
    }
  }
  request(options, function(err, response, body){
    try{
      result = cm.getData(body)
      console.log(result);
      callback(null,result);
    }catch(e){
      console.log('serverList request error')
    }
  })
}

function putDataInTable(data,callback){
  data.forEach(server=>{
    let serverData = {'Number':server['id'], 'Realm':server['slug']}
      Insert('Realms',serverData)
      Select('Realms')
  })
}
*/

function Insert(table,data,callback) {
  //data는 {column:value} 형식
  //테이블을 가지고 있는 상태에서 받아온 data가 구조에 맞는지 확인 후 실행할것.
  knex(table)
    .insert(data)
    .then(resp => {
      callback(null,resp)
    })
    .catch(err => {
      console.log(err)
      callback(err)
    })
}

function Insert_Condition(table,data,columnName,value,callback){
  knex(table)
    .insert(data)
    .where(columnName,value)
    .then(resp => {
      //console.log(resp)
      callback(null,resp)
    })
    .catch(err => {
      console.log(err)
      callback(err)
    })
}

function Update(table,target, data) {
  let targetKey= Object.keys(target)[0]
  let dataKey = Object.keys(data)[0]

  knex(table)
    .where(target)
    .update(data,[targetKey,dataKey],{includeTriggerModifications:true})
    .then(resp=>{
    })
    .catch(err =>{
      console.log(err)
    })
}

function Delete(table, targetColumn, targetData) {
  knex(table).where(targetColumn, targetData).del()
    .then(resp => {
      console.log(resp)
    })
    .catch(err => {
      console.log(err)
    })
}

function Select(table,callback) {
  let errObj =
    {
      type: 0,
      msg:'??'
    }
  knex.select().table(table)
    .then(resp => {
        //console.log(resp)
        callback(null,resp)
      }
    )
    .catch(err => {
      console.log(err)
      errObj.type = '-1'
      errObj.msg='i  dont know'
      callback(errObj,null)
    })
}

function Select_Condition(table,column,value,callback){
  let errObj = {
    type: 0,
    msg: 'error'
  }
  knex.select().table(table).where(column,value)
    .then(resp=> {
      callback(null, resp)
    })
    .catch(err=>{
      console.log(err)
      errObj.type = '18'
      errObj.msg = 'elect_condition failed whyrano???'
      callback(errObj,null)
    })
}



function GetTableColumns(table) {
  return new knex('INFORMATION_SCHEMA.COLUMNS').where({
    'TABLE_NAME': table,
  }).select('COLUMN_NAME')
}

module.exports = {
  getTableColumns: function(table){
    return GetTableColumns(table)
  },
  selectTable: function(table,callback){
    Select(table,callback)
  },
  selectTable_Condition: function(table,column,value,callback){
    Select_Condition(table,column,value,callback);
  },
  insertTable:function(table,data,callback){
    Insert(table,data,callback)
  },
  insertTable_Condition: function(table,data,column,value,callback){
    Insert_Condition(table,data,column,value,callback)
  },
  updateTable:function(table,target,data){
    Update(table,target,data)
  },
  deleteTable:function(table, targetColumn, targetData){
    Delete(table, targetColumn, targetData)
  }
}