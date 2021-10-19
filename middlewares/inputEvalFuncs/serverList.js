const userConfig = require('../../database/userConfigData')
function serverListEvaluation(inputString) {
  if(typeof(inputString) !== 'string') return false

  let realmList = userConfig.getRealmList()

  return realmList.includes(inputString)
}

module.exports = serverListEvaluation