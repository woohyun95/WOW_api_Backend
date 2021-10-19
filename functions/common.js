function getData(data) {
  if (data === null || data === '') {
    console.log('null data json parsing')
    return null
  }
  return JSON.parse(data)
}
function addSubObj(key, value) {
  return {[key]: value}
}

function test(){
  console.log('common function test')
}

module.exports={
  getData: function(data){
    return getData(data)
  },
  addSubObj: function(key, value){
    return addSubObj(key,value)
  },
  test:function(){
    test()
  }
}