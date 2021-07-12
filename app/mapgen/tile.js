var fs = require("fs");
// var mapnik = require("mapnik");
// var mkdirp = require('mkdirp');
const _ = require( "lodash" );
const Step = require( "step" )
var path = require('path');
const internal = require("stream");
var util = require('util');
var mercator = require('@mapbox/sphericalmercator');

// mapnik.register_default_fonts();
// mapnik.register_default_input_plugins();
// mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

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
  // ready for query : knex or direct pg
  // point geojson to mapnik 
  console.log(merc.bbox(req.params.x, req.params.y, req.params.zoom, false,"900913"))
}



module.exports = { fetchTile: fetchTile };