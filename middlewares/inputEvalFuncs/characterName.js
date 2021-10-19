function characterNameEvaluation(chaName) {
  if(typeof (chaName) !== 'string') return false
  if(chaName.length < 2 && chaName.length > 10 ) return  false
  return true
}


module.exports = characterNameEvaluation