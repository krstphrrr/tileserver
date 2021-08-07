const { Pool } = require('pg');
const config = require( "../../config" );


const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.dbname,
    user: config.database.user,
    password: config.database.password,
  });



module.exports = pool
