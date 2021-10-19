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

router.post('/', getCharacterGearData)

function getCharacterGearData(req, res) {
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
      getCharacterImage,
      getGearData,
      getGearMedia,
      gatherGearData
    ]
    , function (err, result) {
      mssqlDB.updateTable('CharacterGearData',{'index':characterData['characterIndex']},{'gearData':JSON.stringify(result)})
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
    if (characterData['isRegistered']) {
      timeCheck.UpdateTimestamp(characterData,'gear',(errObj, result) => {
        if (errObj) {
          console.error(errObj)
        }
        callback(null)
      })
    } else {
      timeCheck.InsertTimestamp(characterData,'gear', (errObj, result) => {
        if (errObj) {
          console.error(errObj)
        }
        callback(null)
      })
    }
  }

  function getProfile(callback) {
    let uri = `https://kr.api.blizzard.com/profile/wow/character/${characterData.realm}/${characterData.encodedCharName}`
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

  function getCharacterImage(charData, callback) {
    let uri = `https://kr.api.blizzard.com/profile/wow/character/${characterData.realm}/${characterData.encodedCharName}/character-media`
    const options = {
      uri: uri,
      qs: {
        region: 'kr',
        namespace: 'profile-kr',
        locale: 'en_US',
        access_token: bToken()
      }
    }
    request(options, function (err, response, body) {
      let characterImage = {}
      let data = cm.getData(body)
      if (data.hasOwnProperty('assets')) {
        characterImage = getCharacterMediaUrl_New(data)
      } else {
        characterImage = getCharacterMediaUrl_Old(data)
      }
      try {
        charData['characterMedia'] = characterImage
      } catch (e) {
        console.log(`charData request error ${charData['characterMedia']}`)
      }
      callback(null, charData)
    })

    function getCharacterMediaUrl_Old(rawData) {
      let mediaUrl = {
        bust: rawData['bust_url'],
        avatar: rawData['avatar_url'],
        render: rawData['render_url']
      }
      return mediaUrl
    }

    function getCharacterMediaUrl_New(rawData) {
      let mediaUrl = {}
      rawData['assets'].forEach(img => {
        mediaUrl[img['key']] = img['value']
      })
      return mediaUrl
    }
  }

  function getGearData(charData, callback) {
    let uri = `https://kr.api.blizzard.com/profile/wow/character/${characterData.realm}/${characterData.encodedCharName}/equipment`
    const options = {
      uri: uri,
      qs: {
        region: 'kr',
        namespace: 'profile-kr',
        locale: 'ko_KR',
        access_token: bToken()
      }
    }
    let reqFunc = function (err, response, body) {
      try {
        charData['characterGearData'] = cm.getData(body)['equipped_items']
      } catch (e) {
        console.error(`gearData request error. ${charData['characterData']}`)
      }
      callback(null, charData)
    }
    request(options, reqFunc)
  }

  function getGearMedia(charData, callback) {
    let characterGearMedia = {}
    every(charData.characterGearData, function (gear, callback) {
        let options = {
          uri: `https://kr.api.blizzard.com/data/wow/media/item/${gear['media']['id']}`,
          qs: {
            namespace: "static-kr",
            locale: "ko_KR",
            access_token: bToken()
          }
        }
        let mediaReq = function (err, response, body) {
          try {
            let result = cm.getData(body)
            Object.assign(characterGearMedia, cm.addSubObj(gear['slot']['type'], result['assets'][0]['value']))
          } catch (e) {
            console.error(`gear image request error. ${gear['slot']['type']}`)
          }
          callback(null, true)
        }
        request(options, mediaReq)
      },
      function (err, result) {
        charData['gearImage'] = characterGearMedia
        callback(null, charData)
      }
    )
  }

  function gatherGearData(charData, callback) {
    let gearData = [
      {
        gearType: 'HEAD'
      },
      {
        gearType: 'NECK'
      },
      {
        gearType: 'SHOULDER'
      },
      {
        gearType: 'SHIRT'
      },
      {
        gearType: 'CHEST'
      },
      {
        gearType: 'WAIST'
      },
      {
        gearType: 'LEGS'
      },
      {
        gearType: 'FEET'
      },
      {
        gearType: 'WRIST'
      },
      {
        gearType: 'HANDS'
      },
      {
        gearType: 'FINGER_1'
      },
      {
        gearType: 'FINGER_2'
      },
      {
        gearType: 'TRINKET_1'
      },
      {
        gearType: 'TRINKET_2'
      },
      {
        gearType: 'BACK'
      },
      {
        gearType: 'MAIN_HAND'
      },
      {
        gearType: 'OFF_HAND'
      },
      {
        gearType: 'TABARD'
      },
    ]
    gearData.forEach(gearType => {
      charData['characterGearData'].forEach(gear => {
        if (gear['slot']['type'] === gearType['gearType']) {
          gearType['gearData'] = gear
        }
      })
    })
    charData['gearSlot'] = gearData
    console.log(`gear data's string length is ${gearData.toString().length}`)
    callback(null, charData)
  }
}

//쿼리 data 영역을 검사
// console.log('---check func start---'
// 첫번째 함수 -> 유저체크
// // console.log('---check func end---'

// 두번째 함수 -> 최근 쿼리시간 체크 -> 분기 발생

// 분기 1 데이터  api 가져와서 만들어줌 -> 데이터 보내줌
// 분기 2 기존 데이터 보내줌

module.exports = router;
