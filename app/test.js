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
  app.get('/:layer/:z/:x/:y', (req, res) => {
    res.send('ready for the fun stuff')
    p = req.params;
    fetchTile(p.layer, parseInt(p.z), parseInt(p.x), parseInt(p.y.replace('.png', '')), function(img) {
      // res.send(img);
    });

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