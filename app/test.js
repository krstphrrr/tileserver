const express = require( "express" );
const bodyParser = require( "body-parser" );
const compression = require( "compression" );
const _ = require( "lodash" );
const pgClient = require( "./pg-client" );
let fetchTile = require('./mapgen/tile').fetchTile
// const knex = require('knex');
// const knexPostgis = require('knex-postgis');

// const db = knex({
//   client: 'postgres'
// });
// const st = knexPostgis(db);
// const MapGenerator = require('./mapgen/mapgen')

const API = { };

API.server = ( ) => {
  const app = express()
  // building tiling routes here
  app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', (req, res) => {
    
    p = req.params;
    res.send(p)
    // console.log(req)
    fetchTile(req)
    // fetchTile(p.style, parseInt(p.z), parseInt(p.x), parseInt(p.y.replace('.png', '')), function(img) {
    //   // res.send(img);
    // });

  })





  pgClient.connect( ).then( ( ) => {
    console.log("HM")
    // 
  } ).catch( e => {
    console.log( e );
  } );

  return app;
};

module.exports = API;