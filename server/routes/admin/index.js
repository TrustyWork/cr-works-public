var config				= require( 'config')
    ,listCore			= require( 'core/list')

var otherRoute = [

]


module.exports = function( app) {

    app.get( '/admin/product/blogger/add_blog', function( req, res){

        var category = config.get( 'product:blogger_widget:category');

        res.renderPage( 'admin/blog', { category: category});
    })


    app.post( '/admin/product/blogger/add_blog', function( req, res){

        var params = {
                category: req.body.category
                ,lang: req.body.lang
            }
            ,uri = req.body.uri;


        listCore.updateActiveBlog( uri, params);
        res.end();
    })


    app.get( '/admin/product/blogger/add_alias', function( req, res){


        res.renderPage( 'admin/alias');
    })


    app.post( '/admin/product/blogger/add_alias', function( req, res){

        var alias = req.body.alias
            ,host = req.body.host;

        console.log( alias, host);

        listCore.addAliasBlog( alias, host);
        res.end();
    })


    for( var idx in otherRoute) {

        otherRoute[ idx]( app);
    }
};