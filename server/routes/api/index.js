var config                  = require( 'config')
	,log                    = require( 'libs/log')( module)
	,listCore               = require( 'core/list')

var async                   = require( 'async');


module.exports = function( app) {

	app.get( '/api/blogger/widget/:category/:lang', function( req, res){

		var refererHost = req.headers[ 'referer']
            ,params = req.params;

		if( refererHost) {
            process.nextTick( function(){
                listCore.updateActiveBlog( refererHost, params)
            });
		}

		var list = listCore.list( params, refererHost, 5)
            ,hostname = req.hostname;

        //PIKE begin
        var hostname = config.get( 'host:dev');
        //PIKE end

        var formattedList = [];
        for ( var i in list) {

            var link = list[ i][ 'link']
                ,title = list[ i][ 'title']
                ,post = { title: list[ i][ 'post'][ 'title']}

            var item = {
                link: 'http://' + hostname + '/api/blogger/redirect/rss_widget/?redirect_url=' + link
                ,favicon: link + '/favicon.ico'
                ,title: title
                ,post: post
            }

            formattedList.push( item)
        }

		res.render( 'api/blogger/widget', { list: formattedList, hostname: hostname})
    });


    app.get( '/api/blogger/redirect/:product/', function( req, res){

        var redirectUrl = req.query.redirect_url
            ,refererUrl = req.headers.referer;

        if ( refererUrl) {

            process.nextTick( function(){
                listCore.updateFollow( refererUrl, redirectUrl, req.ip, req.headers);
            });
        }

        res.redirect( redirectUrl);
	});

};
