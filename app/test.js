const express = require( "express" );
const bodyParser = require( "body-parser" );
const compression = require( "compression" );
const _ = require( "lodash" );
const pgClient = require( "./pg-client" );

const API = { };

API.server = ( ) => {
  const app = express()
  // building tiling routes here
  app.get('/', (req, res) => {
    res.send('ready for the fun stuff')
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