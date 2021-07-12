var fs = require("fs");
var mapnik = require("mapnik");
// var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');
var mercator = new(require('@mapbox/sphericalmercator'));

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

const TILE_SIZE = 256;

function getTile(tileFilePath) {
  if (!fs.existsSync(tileFilePath)) {
    return false;
  } else {
    return fs.readFileSync(tileFilePath);
  }
}


function fetchTile(layer, z, x, y, callback) {
  console.log("ok:",layer,z,x,y)
}


module.exports = { fetchTile: fetchTile };