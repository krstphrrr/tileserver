const express = require( "express" );
const bodyParser = require( "body-parser" );
const compression = require( "compression" );
const _ = require( "lodash" );
const pgClient = require( "./pg-client" );
// let fetchTile = require('./mapgen/tile').fetchTile
// const mercator = require('./sphericalmercator')
const mercator = require('@mapbox/sphericalmercator');
let merc = new mercator({size:256})
var path = require('path');
const dbconfig = require('../config')
var fs = require('fs');

const mapnik = require('mapnik');
const e = require("express");
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();
const proj4 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';

//
const createVectorTile = ({ x, y, zoom }) => {

}
const API = { };

API.server = ( ) => {
  const app = express()
  // building tiling routes here
  app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', async (req, res) => {

    let {x,y,zoom} = req.params;
    const dbConfig = {
      host: dbconfig.database.host,
      dbname: dbconfig.database.dbname,
      user: dbconfig.database.user,
      password: dbconfig.database.password,
      type: 'postgis',
      table: '"dataHeader"',
      geometry_field: "wkb_geometry",
      srid: 4326
    };
    zoom = parseInt(zoom, 10)
    x = parseInt(x, 10)
    y = parseInt(y, 10)
  
    const map = new mapnik.Map(256, 256, proj4);
    let layer = new mapnik.Layer('tile', proj4);
    // let bbox = mercator.xyz_to_envelope(parseInt(x), parseInt(y), parseInt(zoom), false);
    layer.datasource = new mapnik.Datasource(
      dbConfig
    );
    layer.styles = ['point'];
    let bbox = merc.bbox(x, y, zoom, false,"WGS84")
    map.add_layer(layer)
    map.extent = bbox
    map.load(path.join(__dirname,'point_vector.xml'),{strict:true}, function(err,map){
      if (err) throw err;

      let im = new mapnik.Image(256,256)
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

  })





  // pgClient.connect( ).then( ( ) => {
  //   console.log("HM")
  //   // 
  // } ).catch( e => {
  //   console.log( e );
  // } );

  return app;
};

module.exports = API;