
const API = require("./server")
const PORT = Number( process.env.PORT || 3000 );

const main = ( ) => {
  const app = API.server()
  return app
}

if ( require.main === module ) {
  main( ).listen( PORT );
  if ( process.pid ) {
    console.log( `This process is your pid: ${process.pid}` );
  }
} else {
  module.exports = main( );
}