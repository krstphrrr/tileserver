const pg = require( "pg" );
const moment = require( "moment-timezone" );
const config = require( "../config" );


const pgClient = { connection: null };

const { types } = pg;
const timestampOID = 1114;
moment.tz.setDefault( "UTC" );
types.setTypeParser( timestampOID, stringValue => (
  moment( stringValue ).format( "YYYY-MM-DDTHH:mm:ssZ" )
) );

pgClient.connect = async cfg => {
  
  if(pgClient.connection){return pgClient.connection}
    const thisConfig = Object.assign({}, config, cfg)

    const pgConfig = {
      user:thisConfig.database.user,
      password: thisConfig.database.password,
      host: thisConfig.database.host,
      port: thisConfig.database.port,
      database: thisConfig.database.dbname
    }
    const client = new pg.Client( pgConfig )
    client.connect(err=>{
      if(err){
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
      }
    })
    return pgClient.connection
}

pgClient.connect( )
  .then( { } )
  .catch( e =>{
    console.log( e )
    process.exit()
  })

module.exports = pgClient