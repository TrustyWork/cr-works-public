var path				= require( 'path')
	,log         		= require( 'libs/log')( module)

module.exports = function( req, res, next) {

	res.renderPage = function( template, params, layout){

		if( typeof params == 'undefined') {
			params = {};
		}

		params.template = template;
		params.lang = req.getLocale();

		if( params !== Object( params)) {
			params = {};
		}

		if( ! layout) {
			layout = 'main';
		}

		res.render( template, params, function( err, html){
			if( err) { log.error( err)}

			params.content = html;

			if( typeof params.title == 'undefined') {
				params.title = template;
			}

			layout = path.join( 'layout', layout);

			res.render( layout, params);
		});
	}

	next();
}