const express = require('express')
const {ldcPull, mapnikRet, qryBuilder} = require('./mapgen/mapnikConfig')
var path = require('path');
const app = express()
const mercator = require('@mapbox/sphericalmercator');
const port = Number( process.env.PORT || 3000 );
const cors = require('cors')
const pool = require('./mapgen/pool')
const redis = require('redis')
const mapnik = require('mapnik')
const client = redis.createClient(6379, "redis")
const dbconfig = require('../config')
let corsOptions = {
  origin:'http://localhost:4200'
  
}

app.get('/:style/:zoom/:x/:y.:format([a-z.]+)',cors(), async(req, res) => {
  // let {style, zoom,x,y,format} = req.params
  // res.send({style, zoom, x, y, format})
  switch(req.params.format){
    case 'png':
      console.log(qryBuilder(req.query))
      // if there are any additional query parameters, 
      // include them in ldcPull arguments
      // if(Object.keys(req.query).length>0){
      //   // first route
      //   map = ldcPull(req.params, req.query)
        
      // } else {
      //   // second route
      //   map = ldcPull(req.params)
      // }
      // let map = ldcPull(req.params)
      /////////////////////////////////
      // let merc = new mercator({size:256})
      mapnik.register_default_fonts();
      mapnik.register_default_input_plugins();
      let merc = new mercator({size:256})
      sql = '"dataHeader"'
      // const proj4 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +no_defs +over"
      let {x,y,zoom} = req.params;
      const dbConfig = {
        host: dbconfig.database.host,
        dbname: dbconfig.database.dbname,
        user: dbconfig.database.user,
        password: dbconfig.database.password,
        type: 'postgis',
        table: sql,
        geometry_field: "wkb_geometry",
        srid: 4326,
        // srid: 3857,
      };
      zoom = parseInt(zoom, 10)
      x = parseInt(x, 10)
      y = parseInt(y, 10)
      const map = new mapnik.Map(256, 256);
      const layer = new mapnik.Layer('tile');
      
      layer.datasource = new mapnik.Datasource(
        dbConfig 
      );
      layer.styles = ['point'];
      // map.layers[0].status = false
      const bbox = merc.bbox(x, y, zoom, false,"WGS84", 256)
      // console.log(tile2degree(x,y,zoom), bbox)
      // let envelope = mapnik.envelope(bbox)
      map.add_layer(layer)
      map.add_layer(layer)
      map.add_layer(layer)
      // map.layers()[0]=false
      console.log(map.layers())
      map.extent = bbox






      /////////////////////////////////
      if(map){
        // once mapnik layer is created, load styles
        map.load(path.join(__dirname,'point_vector.xml'), function(err,map){
          if (err) throw err;
          // map.zoomTo(bbox)
          let im = new mapnik.Image(256,256)
          map.render(im, function(err,tile){
            if(err){
              throw err
            } else {
              tile.encode('png256',function(err,buffer){
                console.log(buffer)
                if(err) throw err;
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(buffer)
              })
            }
          })
        
        })
      } 
      break;
    case 'pbf':
      //mapnik alternative
      // let merc = new mercator({size:256})
      // let {style, zoom,x,y,format} = req.params
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

