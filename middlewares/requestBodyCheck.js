const noneCheckApi = ['/', '/login']
const apiObj = require('./apiDataObj')
const chaNameEval = require('./inputEvalFuncs/characterName')
const serverNameEval = require('./inputEvalFuncs/serverList')
const regionEval = require('./inputEvalFuncs/region')

function bodyCheck(req, res, next) {
  let url = req['url']

  if (noneCheckApi.includes(url)) return next()
  if (!apiObj.hasOwnProperty(url)) return res.send('error')
  let dataEvalObj = apiObj[url]['data']
  console.log(dataEvalObj)
  let body
  try {
    body = JSON.parse(JSON.stringify(req.body))
  } catch (e) {
    res.send('error')
  }
  for (const dataKey in dataEvalObj) {
    if (!body.hasOwnProperty(dataKey)) return res.send({'errorString':'error'})
  }
  for (const dataKey in dataEvalObj) {
    console.log(`input value: ${body[dataKey]} type:${dataEvalObj[dataKey]['type']}`)
    if (!valueCheck(body[dataKey], dataEvalObj[dataKey]['type'])) return res.send({'errorString':'error'})
  }
  next()
}

function valueCheck(value, type) {
  switch (type) {
    case 'characterName':
      return chaNameEval(value)
    case 'serverList':
      return serverNameEval(value)
    case 'region':
      return regionEval(value)
    default:
      return false
  }
}


module.exports = bodyCheck
