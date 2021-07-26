const sqlHelper = require('./utils')
const mapnik = require('mapnik');
const dbconfig = require('../../config')
const mercator = require('@mapbox/sphericalmercator');
const knex = require('knex')({client:'pg'})
const _ = require( "lodash" );

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();
const proj4 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
let merc = new mercator({size:256})


exports.qryBuilder = (params) => {
  let qry = knex('dataHeader')
            .join('dataGap', 'dataGap.PrimaryKey','dataHeader.PrimaryKey')
            
            .modify(function(qb){
              // example of conditional handling of numeric queries for gap start
              if(params['dataGap.GapStart']){
                if(params['dataGap.GapStart'].includes('-')){
                  qb.whereBetween('dataGap.GapStart',params['dataGap.GapStart'].split('-').map(x=>+x))
                    .where(_.omit(params,'dataGap.GapStart'))
                } else {
                  qb.where('dataGap.GapStart',parseFloat(params['dataGap.GapStart']))
                    .where(_.omit(params,'dataGap.GapStart'))
                }
              } else {
                
                qb.where(params)
              }
            
            })
            .select()
  return qry.toString()
}




exports.ldcPull = (params , query=null) => {
  let sql
  switch(query){
    case null:
      sql = '"dataHeader"'
      break
    default:
      // let magicString = sqlHelper(query)
      let realQry = this.qryBuilder(query)
      sql =`(${realQry}) as tile`
  }
  
  let {x,y,zoom} = params;
    const dbConfig = {
      host: dbconfig.database.host,
      dbname: dbconfig.database.dbname,
      user: dbconfig.database.user,
      password: dbconfig.database.password,
      type: 'postgis',
      table: sql,
      geometry_field: "wkb_geometry",
      srid: 4326,
      persist_connection:false
    };
    zoom = parseInt(zoom, 10)
    x = parseInt(x, 10)
    y = parseInt(y, 10)
    if ( zoom < 0 || zoom > 21 ) {
      // should return error stack and 404
      console.log("invalid zoom")
    }
    const zoomDimension = Math.pow( 2, zoom );
    if ( x < 0 || x >= zoomDimension ) {
      // should return error stack and 404
      console.log("invalid x");
    }
    if ( y < 0 || y >= zoomDimension ) {
      // should return error stack and 404
      console.log("invalid y")
    }
    
    const map = new mapnik.Map(256, 256, proj4);
    let layer = new mapnik.Layer('tile', proj4);
    
    layer.datasource = new mapnik.Datasource(
      dbConfig 
    );
    layer.styles = ['point'];
    let bbox = merc.bbox(x, y, zoom, false,"WGS84")
 
    map.add_layer(layer)
    map.extent = bbox
    return map
}


exports.mapnikRet =(height,width)=>{
  return new mapnik.Image(height,width)
}