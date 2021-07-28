const express = require('express')
const {ldcPull, mapnikRet, qryBuilder} = require('./mapgen/mapnikConfig')
var path = require('path');
const app = express()
const port = Number( process.env.PORT || 3000 );

app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', async (req, res) => {
  console.log(qryBuilder(req.query))
  // if there are any additional query parameters, 
  // include them in ldcPull arguments
  if(Object.keys(req.query).length>0){
    // first route
    map = ldcPull(req.params, req.query)
    
  } else {
    // second route
    map = ldcPull(req.params)
  }
  
  if(map){
    // once mapnik layer is created, load styles
    map.load(path.join(__dirname,'point_vector.xml'),{strict:true}, function(err,map){
      if (err) throw err;
      // handling the set up of a new mapnik image externally
      let im = mapnikRet(256,256)
      map.render(im, function(err,tile){
        if(err){
          throw err
        } else {
          tile.encode('png8',function(err,buffer){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(buffer)
          })
        }
      })
    
    })
  }
})
// const main = ( ) => {
//   const app = API.server()
//   return app
// }

app.listen(port,()=>{
  console.log(`todo esta bien; usando puerto:${port}`)
  if ( process.pid ) {
    console.log( `This process is your pid: ${process.pid}` );
  }
})

