module.exports = function( req, res, next) {

	if( typeof req.query.lang != 'undefined') {
		var lang = req.query.lang;

		res.cookie( 'lang', lang, { httpOnly: false});

		var location = req.path;
		res.redirect( location);
	} else {
		next();
	}
}