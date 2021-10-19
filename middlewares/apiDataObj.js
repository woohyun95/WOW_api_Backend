let apiDataObj = {
  '/getCharacterData': {
    data: {
      'characterName': {
        type: 'characterName',
      },
      'server': {
        type: 'serverList'
      },
      'region':{
       type: 'region'
      }
    }
  },
  '/getProgressData': {
    data: {
      'characterName': {
        type: 'characterName',
      },
      'server': {
        type: 'serverList'
      },
      'region':{
        type: 'region'
      }
    }
  }
}

module.exports = apiDataObj
//typelist =[.......]
//type
// string=[itemString, skillString...], number, ........