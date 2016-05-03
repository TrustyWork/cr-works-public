var otherRoute = [
    require( './blogger')
]


module.exports = function( app) {

    for( var idx in otherRoute) {

        otherRoute[ idx]( app);
    }
}