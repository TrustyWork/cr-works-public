var otherRoute = [
    ,require( './site')
    ,require( './api')
    ,require( './product')
    ,require( './admin')
]


module.exports = function( app) {

    for( var idx in otherRoute) {

        otherRoute[ idx]( app);
    }
}