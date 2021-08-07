const express = require('express')
// const {ldcPull, mapnikRet, qryBuilder} = require('./mapgen/mapnikConfig')
var path = require('path');
const app = express()
const mercator = require('@mapbox/sphericalmercator');
const port = Number( process.env.PORT || 3000 );

const pool = require('./mapgen/pool')


app.get('/:style/:zoom/:x/:y.mvt', async(req, res) => {
  // 
  switch(req.params.style){
    case 'grid':
      // console.log(qryBuilder(req.query))
      // // if there are any additional query parameters, 
      // // include them in ldcPull arguments
      // if(Object.keys(req.query).length>0){
      //   // first route
      //   map = ldcPull(req.params, req.query)
        
      // } else {
      //   // second route
      //   map = ldcPull(req.params)
      // }
      
      // if(map){
      //   // once mapnik layer is created, load styles
      //   map.load(path.join(__dirname,'point_vector.xml'),{strict:true}, function(err,map){
      //     if (err) throw err;
      //     // handling the set up of a new mapnik image externally
      //     let im = mapnikRet(256,256)
      //     map.render(im, function(err,tile){
      //       if(err){
      //         throw err
      //       } else {
      //         tile.encode('png8',function(err,buffer){
      //           if(err) throw err;
      //           res.writeHead(200, {'Content-Type': 'image/png'});
      //           res.end(buffer)
      //         })
      //       }
      //     })
        
      //   })
      // }
      break;
    case 'points':
      //mapnik alternative
      let merc = new mercator({size:256})
      let {style, zoom,x,y,format} = req.params
      let qry = pool.query(getTile(x,y,zoom))
      // res.send()
      qry.then(result => {
        console.log(result.rows[0].mvt)
        const mvt = result.rows[0].mvt
        res.setHeader('Content-Type', 'application/x-protobuf')
        res.send(mvt)
      })      
      break
      

  }
  
})


const getTile=(x,y,zoom) =>{
  let sql = `
  WITH webmercator(envelope) AS (
    SELECT ST_TileEnvelope(${zoom},${x}, ${y})
  ),
  wgs84(envelope) AS (
    SELECT ST_Transform((SELECT envelope FROM webmercator), 4326)
  ),
b(bounds) AS (
    SELECT ST_MakeEnvelope(-180, -85.0511287798066, 180, 85.0511287798066, 4326)
  ),
  geometries(wkb_geometry) AS (
  SELECT 
      CASE WHEN ST_Covers(b.bounds, wkb_geometry)
           THEN ST_Transform(wkb_geometry,3857) 
           ELSE ST_Transform(ST_Intersection(b.bounds, wkb_geometry),3857) 
           END
    FROM "dataHeader"
    CROSS JOIN b
    WHERE wkb_geometry && (SELECT envelope FROM wgs84) 
  )
  SELECT ST_AsMVT(tile) as mvt FROM (
    SELECT  ST_AsMVTGeom(wkb_geometry, (SELECT envelope FROM webmercator))
    FROM geometries
  ) AS tile
`
return sql
}

app.listen(port,()=>{
  console.log(`todo esta bien; usando puerto:${port}`)
  if ( process.pid ) {
    console.log( `This process is your pid: ${process.pid}` );
  }
})

