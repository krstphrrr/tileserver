const express = require('express')
const {ldcPull, mapnikRet, qryBuilder} = require('./mapgen/mapnikConfig')
var path = require('path');
const app = express()
const mercator = require('@mapbox/sphericalmercator');
const port = Number( process.env.PORT || 3000 );
const pool = require('./pg-client')

app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', async (req, res) => {
  switch(req.params.style){
    case 'grid':
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
    break;
    case 'points':
      let merc = new mercator({size:256})
      
      
      let {style, zoom,x,y,format} = req.params
      let mercBBox = merc.bbox(x, y, zoom, false,3857)

      let merc2 = customMerc(x,y,zoom)
      let env = envelopeSQL(merc2)
      // console.log(sqlTemplate(merc2))
      // console.log(mercBBox)
      // console.log(merc2)
      console.log(sqlTemplate(merc2))
      res.send(sqlTemplate(merc2))
      break
      

  }
  
})
const customMerc = (x,y,z) => {
  // let worldMercMax =  20037508.3427892
  let worldMercMax = 180
  let worldMercMin = -1 * worldMercMax
  let worldMercSize = worldMercMax - worldMercMin

  let worldTileSize = 2 ** z 

  let tileMercSize = worldMercSize / worldTileSize

  let env = {}
  env['xmin'] = (worldMercMin + tileMercSize * x)
  env['xmax'] = (worldMercMin + tileMercSize * (x + 1))
  env['ymin'] = (worldMercMax - tileMercSize * (y + 1))
  env['ymax'] = (worldMercMax - tileMercSize * y)

  return env
 
}

const envelopeSQL = (env) => {
  DENSIFY_FACTOR = 4
  env['segSize'] = ((env['xmax'] - env['xmin'])/DENSIFY_FACTOR).toFixed(5)
  sql_tmpl = `ST_Segmentize(ST_MakeEnvelope(min(${env.xmin}),min(${env.ymin}),max(${env.xmax}),max(${env.ymax}), 3857),min(${env.segSize}))`
  return sql_tmpl
}

const sqlTemplate = (env) => {
  let tbl = {
    'table':       '"dataHeader"',
    'srid':        '26918',
    'geomColumn':  'wkb_geometry',
    'attrColumns': '"PrimaryKey",wkb_geometry'
    }
  tbl['env'] = envelopeSQL(env)

  sql_tmpl = `
  WITH 
  bounds AS (
      SELECT ${tbl.env} AS geom, 
             ${tbl.env}::box2d AS b2d
  ),
  mvtgeom AS (
      SELECT ST_AsMVTGeom(ST_Transform(t.${tbl.geomColumn}, 3857), bounds.b2d) AS geom, 
             ${tbl.attrColumns}
      FROM ${tbl.table} t, bounds
      WHERE ST_Intersects(t.${tbl.geomColumn}, ST_Transform(bounds.geom, 26918))
  ) 
  SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
`
return sql_tmpl
}



app.listen(port,()=>{
  console.log(`todo esta bien; usando puerto:${port}`)
  if ( process.pid ) {
    console.log( `This process is your pid: ${process.pid}` );
  }
})

