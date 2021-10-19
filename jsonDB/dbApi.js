const JSONdb = require('simple-json-db');
const request = require('request');
const waterfall =require('async').waterfall
const everyLimit = require('async').everyLimit
const cm = require('../functions/common')
const baseDB = require('../jsonDB/baseDB.json')

function init() {
  console.log('start db setting...')
  waterfall([
    getToken,
  ], function(err,result){
    console.log('db setting end...')
  })
}
function setDB(key,value,dbName) {
  const selectedDB = new JSONdb(`./jsonDB/${dbName}.json`);
  selectedDB.set(key,value)
}

function setCharDB(server,charName,data){
  const selectedDB = new JSONdb(`./jsonDB/serverList/${server}.json`)
  selectedDB.set(charName,data)
}

function createServerDB(dbName){
  const serverDB = new JSONdb(`./jsonDB/serverList/${dbName}.json`)
  serverDB.set('server',dbName)
}

function createDB(dbName){
  const serverDB = new JSONdb(`./jsonDB/${dbName}.json`);
  serverDB.set('dbType',dbName)
}
function getDB(dbName){
  const selectedDB = new JSONdb(`./jsonDB/${dbName}.json`)

  return selectedDB.JSON()
}
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
  //console.log(data)
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
      let result = cm.getData(body)
      Object.assign(data, cm.addSubObj('serverList',result))
     // console.log(result)
    }catch(e){
      console.log('serverList request error')
    }
  })
  callback(null,data)
}

function getDungeonImage(data, callback) {
  let dungeonIdList = [741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754,
    755, 756, 759, 757, 760, 758, 761, 75, 73, 72, 74, 78, 187, 317, 330, 320, 362, 369, 477, 457, 669, 768,
    861, 786, 875, 946, 1031, 1176, 1177, 1179, 1180, 1190]
  let dungeonImage ={}
  let errCount = 0
  everyLimit(dungeonIdList, 5, function (id, callback) {
      let options = {
        uri: `https://kr.api.blizzard.com/data/wow/media/journal-instance/${id}`,
        qs: {
          namespace: 'static-kr',
          locale: 'ko_KR',
          access_token: bToken()
        }
      }
      request(options, function (err, response, body) {
          try {
            let result = cm.getData(body)
            let imageData = {
              id: id,
              url: result['assets'][0]['value']
            }
            Object.assign(dungeonImage, cm.addSubObj(imageData['id'], imageData['url']))
          } catch (e) {
            errCount++
            console.log(`dungeon Image error: ${id}`)
          }
          callback(null, true)
        }
      )
    },
    function (err, result) {
      console.log(`errCount = ${errCount}`)
      Object.assign(data, cm.addSubObj('dungeonImage',dungeonImage))
      callback(null, data)
    }
  )
}

module.exports = {
  init: function(){
    init()
  },
  token: function(){
    return token
  },
  setCharData: function(server,charName,data){
    setCharDB(server,charName,data)
  },
  getDB: function(dbName){
    return getDB(dbName)
  }
}