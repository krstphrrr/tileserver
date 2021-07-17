const express = require( "express" );
const bodyParser = require( "body-parser" );
const compression = require( "compression" );
const _ = require( "lodash" );
const pgClient = require( "./pg-client" );
// let fetchTile = require('./mapgen/tile').fetchTile
const dbconfig = require('../config')

const mapnik = require('mapnik');
mapnik.register_default_input_plugins();
const proj4 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';

const createVectorTile = (sql,{ x, y, zoom }) => {
  const dbConfig = {
    host: dbconfig.database.host,
    dbname: dbconfig.database.dbname,
    user: dbconfig.database.user,
    password: dbconfig.database.password,
    type: 'postgis',
    table: `(${sql}) as tile`,
  };
  zoom = parseInt(zoom, 10)
  x = parseInt(x, 10)
  y = parseInt(y, 10)

  const map = new mapnik.Map(256, 256, proj4);
  let layer = new mapnik.Layer('tile', proj4);
  layer.datasource = new mapnik.Datasource(
    dbConfig
  );
  map.add_layer(layer);
  const vector = new mapnik.VectorTile(
    zoom, x, y
  );

  return new Promise((res, rej) => {
    map.render(vector, (err, vectorTile) => {
      if (err) return rej(err);
      vectorTile.getData((err, buffer) => {
        if (err) return rej(err);
        return res(buffer);
      });
    });
  });
}
const API = { };

API.server = ( ) => {
  const app = express()
  // building tiling routes here
  app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', async (req, res) => {
    const sql = 'select wkb_geometry from "dataHeader"'
    console.log(req.params, sql)
    
    const tile = await createVectorTile(
      sql,
      req.params
    )
    res
      .setHeader(
        'Content-Type',
        'application/x-protobuf'
      )
      .status(200).send(tile)

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