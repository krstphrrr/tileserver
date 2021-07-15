var fs = require("fs");
var mapnik = require("mapnik");
let mapnikify = require('@mapbox/geojson-mapnikify')
// var mkdirp = require('mkdirp');
const _ = require( "lodash" );
const Step = require( "step" )
const path = require('path');
const internal = require("stream");
const util = require('util');
const mercator = require('@mapbox/sphericalmercator');
const config = require( "../../config" );
const knexPostgis = require('knex-postgis')
const knex = require('knex')({
  client:'pg',
  connection:{
    host:config.database.host,
    user:config.database.user,
    password:config.database.password,
    database:config.database.dbname

  }
})
const knexPg = knexPostgis(knex)
// mapnik.register_default_fonts();
// mapnik.register_default_input_plugins();
// mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));
var width = 512;
var height = 512;
const TILE_SIZE = 256;

function getTile(tileFilePath) {
  if (!fs.existsSync(tileFilePath)) {
    return false;
  } else {
    return fs.readFileSync(tileFilePath);
  }
}
function pathToFile(x,y,z,format){
  if(x && y && z && format){
    return {
      'zoom': x
    }
  }
}

function fetchTile(req,res) {

  let valid = req.params
  console.log(valid)
  req.startTime = Date.now()
  req.params.zoom = parseInt(req.params.zoom, 10)
  req.params.x = parseInt(req.params.x, 10)
  req.params.y = parseInt(req.params.y, 10)
  if ( req.params.zoom < 0 || req.params.zoom > 21 ) {
    // should return error stack and 404
    console.log("invalid zoom")
  }
  const zoomDimension = Math.pow( 2, req.params.zoom );
  if ( req.params.x < 0 || req.params.x >= zoomDimension ) {
    // should return error stack and 404
    console.log("invalid x");
  }
  if ( req.params.y < 0 || req.params.y >= zoomDimension ) {
    // should return error stack and 404
    console.log("invalid y")
  }
  if ( !_.includes( ["png"], req.params.format ) ) {
    // should return error stack and 404
    console.log("invalid format")
  }
  let merc = new mercator({size:256})
  let arr = merc.bbox(req.params.x, req.params.y, req.params.zoom, false,"WGS84")
  // ready for query : knex or direct pg
  // point geojson to mapnik 
  // knexPg.makeEnvelope(arr[0],arr[1],arr[2],arr[3]).then(e=>{
  //   console.log(e)
    
  // })
  knex.raw(`select json_build_object('type', 'FeatureCollection','features', json_agg(ST_AsGeoJSON( wkb_geometry)::json)) from "dataHeader"`).then(e=>{
    // console.log(e.rows[0].json_build_object)
    if(e){
      mapnikify(e.rows[0].json_build_object, false, function(err,xml){
        if(err) throw err;
        let map = new mapnik.Map(512,512)
        map.fromString(xml,{},function(err,map){
          if(err) throw err;
          map.zoomAll()
          let im = new mapnik.Image(width,height)
          map.render(im,function(err,buff){
            if(err) throw err;
            console.log(buff)
          })
        })
      })
    }
  })
  

  console.log( merc.bbox(req.params.x, req.params.y, req.params.zoom, false,"WGS84"))
}



module.exports = { fetchTile: fetchTile };