var config				= require( 'config')
	,log				= require( 'libs/log')(module)
	,listCore			= require( 'core/list')

var async				= require( 'async')


module.exports = function( app) {

	app.get( '/product/blogger', function( req, res){

		var list = listCore.list()
            ,category = config.get( 'product:blogger_widget:category')
            ,lastParse = listCore.lastParseTime();

        var blogCount = list.length
            ,follow = 0;

        for( var idx in list){
            var blog = list[ idx];
            follow+= blog.follow.in;
            console.log( blog.follow)
            delete( blog);
        }
        delete( list);

    	res.renderPage( 'product/blogger/index', { blogCount: blogCount, category: category, lastParse: lastParse, follow: follow});
	});


    app.get( '/product/blogger/rss_widget/full_list', function( req, res){

        var list = listCore.list()
            ,category = config.get( 'product:blogger_widget:category');

        res.renderPage( 'product/blogger/rss_widget/list', { list: list, category: category});
    });


    app.get( '/product/blogger/rss_widget/freeloader', function( req, res){

        var list = listCore.inactiveWidgets()
            ,category = config.get( 'product:blogger_widget:category');

        //filter passive category
        list = list.filter( function( el) {
            if ( el.params.lang == 'ru' && el.params.category == 2) {
                return true;
            }
            return false;
        });

        res.renderPage( 'product/blogger/rss_widget/freeloader', { list: list, category: category});
    });


    app.get( '/product/blogger/rss_widget/parser_uri', function( req, res){

        var list = listCore.uriList();

        res.renderPage( 'product/blogger/rss_widget/parser_uri', { list: list});
    });


    app.get( '/product/blogger/rss_widget/parser_broken', function( req, res){

        var list = listCore.brokenUriList();

        res.renderPage( 'product/blogger/rss_widget/parser_broken', { list: list});
    });
}