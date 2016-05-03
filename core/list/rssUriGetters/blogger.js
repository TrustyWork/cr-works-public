var config			        	= require( 'config')
    ,log				        = require( 'libs/log')( module)

function parse( uri) {

    //normalize uri, example http://sdfgd:www.forgotten-warp.blogspot.com/feeds/posts/default?max-results=1 => http://forgotten-warp.blogspot.com/
    var regex = /(http:\/\/)?([^:]+:)*(www\.)?([^/]+)\//
        ,result = uri.match( regex);
    delete( regex);

    if( ! result || typeof result[ 4] == 'undefined') {
        log.warn( 'cant parse uri `%s`', uri);
        delete( uri);
        delete( result);
        return null;
    }
    var uri = 'http://' + result[ 4];
    delete( result);

    var lenght = uri.indexOf( '.blogspot.')
    if( lenght == -1) {
        delete( uri);
        delete( lenght);
        return null;
    }
    var uri = uri.substr( 0, lenght);
    delete( lenght);

    uri+= '.blogspot.com';
    return uri;
}

module.exports.parse = parse;