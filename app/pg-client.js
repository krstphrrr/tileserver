const { Pool, Client } = require( "pg" )
const config = require( "../config" );

const pool = new Pool({
  user:config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.dbname
})

module.exports = pool