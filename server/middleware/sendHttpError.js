module.exports = function( req, res, next) {

	res.sendHttpError = function( error) {

        if( typeof error == 'number') {
            var httpError = {
                400: 'Bad Request'
                ,403: 'Forbidden'
                ,404: 'Not Found'
                ,500: 'Internal Server Error'
                ,501 : 'Server error'
            }

            if( typeof httpError[ error] == 'undefined') {
                error = 500;
            }

            error = httpError[ error];
        }

		res.status( error.status);

		if ( res.req.headers[ 'x-requested-with'] == 'XMLHttpRequest') {

			res.json( error);
    	} else {

            console.log( error);
			res.render( 'error', { error: error});
		}
  };

  next();

};