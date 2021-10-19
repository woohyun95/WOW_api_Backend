let userConfig = require('../../database/userConfigData')
function characterRegionEvaluation(region){
  let regionList = userConfig.getRegionList()
  console.log('this is region test')
console.log(regionList)
  if(typeof(region) !== 'string') return false
  if(regionList.includes(region)) return true
  else return false
}

module.exports = characterRegionEvaluation;