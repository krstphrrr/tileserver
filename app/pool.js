const pg = require( "pg" );
const moment = require( "moment-timezone" );
const config = require( "../config" );

const { types } = pg;
const timestampOID = 1114;
moment.tz.setDefault( "UTC" );
types.setTypeParser( timestampOID, stringValue => (
  moment( stringValue ).format( "YYYY-MM-DDTHH:mm:ssZ" )
) );

const pgConfig = {
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.dbname,
  ssl: config.database.ssl
};

const pool = new pg.Pool( pgConfig );

module.exports = pool;