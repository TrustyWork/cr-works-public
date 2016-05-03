var onlyAuthUser = function( req, res, next) {
	if( ! req.session.uid) {
		res.redirect( '/');
	} else {
		next();
	}
}

module.exports.onlyAuthUser = onlyAuthUser;