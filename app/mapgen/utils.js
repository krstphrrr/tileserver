module.exports = sqlHelper = (queries) => {
  let strArray = []
  if(Object.keys(queries).length<=1){
    let str = ""
    for(const [key,value] of Object.entries(queries)){
      str += `"${key}"='${value}'`
      
    }
    return str
  } else {
    
    for(const [key,value] of Object.entries(queries)){
      let str = ""
      str += `"${key}"='${value}'`
      strArray.push(str)
      
    }
    return strArray.join(" AND ")
  }
}