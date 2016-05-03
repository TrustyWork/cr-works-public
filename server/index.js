var config				= require( 'config')
	,log         		= require( 'libs/log')( module)
	,http				= require( 'http')
	,routes				= require( './routes')

function up( app){

	//Http server
	httpServer = module.exports.http = http.createServer( app).listen( config.get( 'port'));

	httpServer.on( 'listening', function() {
		log.info( 'Http express server listening on port %d', config.get( 'port'));

		//routes
		routes( app);
		log.info( 'Http routes up');

		//Socket server
	});
}

module.exports.up = up;