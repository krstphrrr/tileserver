const express = require( "express" );
const bodyParser = require( "body-parser" );
const compression = require( "compression" );
const _ = require( "lodash" );
const pgClient = require( "./pg-client" );
const {ldcPull, mapnikRet, qryBuilder} = require('./mapgen/mapnikConfig')
// const mercator = require('./sphericalmercator')


var path = require('path');

var fs = require('fs');


const e = require("express");




const API = { };

API.server = ( ) => {
  const app = express()
  let map
  app.get('/:style/:zoom/:x/:y.:format([a-z.]+)', async (req, res) => {
    console.log(qryBuilder(req.query))
    if(Object.keys(req.query).length>0){
      map = ldcPull(req.params, req.query)
      
    } else {
      map = ldcPull(req.params)
    }
    
    if(map){
      map.load(path.join(__dirname,'point_vector.xml'),{strict:true}, function(err,map){
        if (err) throw err;
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
  })

  return app;
};

module.exports = API;