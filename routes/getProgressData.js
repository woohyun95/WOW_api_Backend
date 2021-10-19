const express = require('express');
const router = express.Router();
const request = require('request');
const waterfall = require('async').waterfall
const every = require('async').every

//functions
const cm = require('../functions/common')
const mssqlDB = require('../database/knexQuery')
const dbCheck = require('../functions/checkCharacterData');
const indexCheck = require('../functions/getIndexData')
const timeCheck = require('../functions/checkCharacterTimestamp')

router.post('/', getProgressData)

function getProgressData(req,res){
  let characterData = {
    characterName: req.body['characterName'],
    encodedCharName :encodeURIComponent(req.body['characterName']),
    realm: req.body['server'],
    region: req.body['region'],
    characterIndex: null,
    realmIndex: null,
    regionIndex: null,
    isRegistered: null
  }

  waterfall([
    checkDB,
    getCharacterData,
    updateTimeStamp,
    getProfile,
    getDungeonData
  ],function(err,result){
    console.log("progress register!")
    //if(characterData['isRegistered']){
      mssqlDB.updateTable('CharacterProgressData',{'index':characterData['characterIndex']},{'progressData':JSON.stringify(result['raidProgressData'])})
    //}else{
    //  mssqlDB.insertTable('CharacterProgressData',{'index':characterData['characterIndex'],'progressData':JSON.stringify(result['raidProgressData'])},(errObj,data)=>{
    //    if(errObj){
    //      console.error(errObj)
    //    }
     // })
   // }
   res.send(result)
  })

  function checkDB(callback) {
    dbCheck.checkCharacterDatabase(characterData, (errObj, data) => {
      if (errObj) {
        console.error(errObj)
        callback(errObj)
      } else {
        characterData['isRegistered'] = data
        callback(null)
      }
    });
  }

  function getCharacterData(callback) {
    if (characterData['isRegistered']) {
      indexCheck.GetExistingData(characterData, (errObj, result) => {
        if (errObj) {
          console.error(errObj)
          callback(errObj)
        } else {
          characterData = result
          callback(null)
        }
      })
    } else {
      indexCheck.RegisterNewData(characterData, (errObj, result) => {
        if (errObj) {
          console.error(errObj)
          callback(errObj)
        } else {
          characterData = result
          callback(null)
        }
      })
    }
  }

  function updateTimeStamp(callback) {
    console.log(characterData)
    if (characterData['isRegistered']) {
      timeCheck.UpdateTimestamp(characterData,'progress',(errObj, result) => {
        if (errObj) {
          console.error(errObj)
        }
        callback(null)
      })
    } else {
      timeCheck.InsertTimestamp(characterData,'progress', (errObj, result) => {
        if (errObj) {
          console.error(errObj)
        }
        callback(null)
      })
    }
  }
  //todo

  function checkTimeStamp(callback){
    let updateTime= 24 * 60 * 60 * 1000 //이 시간이 지나면 업데이트 허용. 안지났으면 DB에서 그대로 가져옴
    let lastUpdateTimestamp=0;
    mssqlDB.selectTable('UpdateTimestamp',(errObj,data)=>{
      if(errObj){
        callback(errObj)
      }else{
        lastUpdateTimestamp = data
        console.log(lastUpdateTimestamp)
        callback(null,true)
      }
    })
  }

  function getProfile(callback) {
    let uri = `https://kr.api.blizzard.com/profile/wow/character/${characterData['realm']}/${characterData['encodedCharName']}`
    const options = {
      uri: uri,
      qs: {
        region: 'kr',
        namespace: 'profile-kr',
        locale: 'en_US',
        access_token: bToken()
      }
    }
    let charData = {}
    request(options, function (err, response, body) {
      try {
        charData['characterProfile'] = getProfileData(cm.getData(body))
      } catch (e) {
        console.log('profile request error')
      }
      callback(null, charData)
    })

    function getProfileData(rawData) {
      let profile = {
        faction: rawData['faction']['type'],
        title: '',
        realm: rawData['realm']['name'],
        active_spec: rawData['active_spec']['name'],
        race: rawData['race']['name'],
        character_class: rawData['character_class']['name'],
        equipped_item_level: rawData['equipped_item_level'],
        guild: '',
        level: rawData['level'],
      }
      if (rawData.hasOwnProperty('active_title')) {
        profile['title'] = rawData['active_title']['name']
      }
      if (rawData['guild'].hasOwnProperty('name')) {
        profile['guild'] = rawData['guild']['name']
      }
      return profile
    }

  }
  function getDungeonData(charData, callback) {
    let uri = `https://kr.api.blizzard.com/profile/wow/character/${characterData['realm']}/${characterData['encodedCharName']}/encounters/raids`
    const options = {
      uri: uri,
      qs: {
        region: 'kr',
        namespace: 'profile-kr',
        locale: 'ko-KR',
        access_token: bToken(),
      }
    }
    request(options, function (err, response, body) {
      let rawDungeonData = cm.getData(body)
      let progressData = {
        raidProgress: [],
        getRaidProgress: function (rawData) {
          this.raidProgress = this.getRaidProgressData(rawData)
          return this.raidProgress
        },
        getInstanceData: function (data, dungeonName, dungeonId) {
          if (data.difficulty.type === 'LEGACY_10_MAN_HEROIC') {
            data.difficulty.type = 'HEROIC'
          } else if (data.difficulty.type === 'LEGACY_25_MAN_HEROIC') {
            data.difficulty.type = 'HEROIC'
          } else if (data.difficulty.type === 'LEGACY_10_MAN') {
            data.difficulty.type = 'NORMAL'
          } else if (data.difficulty.type === 'LEGACY_25_MAN') {
            data.difficulty.type = 'NORMAL'
          }

          let instanceData = {
            name: dungeonName,
            id: dungeonId,
            difficulty: data.difficulty.type,
            status: data.status.type,
            completedCount: data.progress.completed_count,
            totalCount: data.progress.total_count,
            bossData: []
          }
          data.progress.encounters.forEach(boss => {
            instanceData.bossData.push(boss)
          })
          return instanceData
        },
        getDungeonData: function (data) {
          let data_sorted_by_difficulty = []
          let dungeonName = data.instance.name
          let dungeonId = data.instance.id
          data.modes.forEach(difficulty => {
            data_sorted_by_difficulty.push(this.getInstanceData(difficulty, dungeonName, dungeonId))
          })
          return data_sorted_by_difficulty
        },
        getExpansionData: function (data) {//rawData.expansions[]
          let expansionData = {
            expansionName: data.expansion.name,
            dungeonData: []
          }
          data.instances.forEach(dungeon => {
            expansionData.dungeonData.push(this.getDungeonData(dungeon))
          })
          return expansionData
        },
        getRaidProgressData: function (data) {
          let RaidProgress = []
          //console.log(data.expansions)
          if (data.hasOwnProperty('expansions')) {
            data.expansions.forEach(expansion => {
              RaidProgress.push(this.getExpansionData(expansion))
            })
          }
          return RaidProgress
        }
      }
      try {
        charData['raidProgressData'] = progressData.getRaidProgress(rawDungeonData)
        callback(null, charData)
      } catch (e) {
        console.log(`progress request error.`)
        callback(e)
      }
    })
  }
}

module.exports = router;
