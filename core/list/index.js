var request				        = require( 'request')
	,config			        	= require( 'config')
	,log				        = require( 'libs/log')( module)
	,parseXml	        		= require( 'xml2js').parseString
	,async				        = require( 'async')
	,BloggerWidgetModel	        = require( 'libs/db').BloggerWidgetModel
	,BloggerWidgetVisitedModel	= require( 'libs/db').BloggerWidgetVisitedModel
	,BloggerWidgetAliasModel	= require( 'libs/db').BloggerWidgetAliasModel

var rssUriGetters = {
    blogger                     : require( './rssUriGetters/blogger')
}

var uris = {}
    ,aliasUris = {}
	,brokenUris = {}
	,blogs = []
	,lastParse = null
    ,follow = {};

function getMainBlogUri( uri) {

    for( var parserName in rssUriGetters){

        var link = rssUriGetters[ parserName].parse( uri);

        if( link) {
            break;
        }
    }

    if( ! link) {
        link = uri;
    }

    link = replaceUriAlias( link);

    return link;
}


function replaceUriAlias( alias) {

    if( typeof aliasUris[ alias] == 'undefined') {
        return alias;
    }

    return aliasUris[ alias];
}


function up() {
    //load parser config & blogs


    BloggerWidgetAliasModel.find().lean().exec( function( err, docs) {

        if( err){ log.error( err); throw new Error}

        for( var idx in docs) {
            var doc = docs[ idx];

            var alias = doc.alias
                ,host = doc.host;

            aliasUris[ alias] = host;
            delete( alias);
            delete( host);
            delete( doc);
        }
        delete( docs);
        log.info( 'load %s uri alias', Object.keys( aliasUris).length);

        loadBlogs();
        loadStatistic();
    });


    function loadBlogs() {
        BloggerWidgetModel.find().lean().exec( function( err, docs) {

            if( err){ log.error( err); throw new Error}

            for( var idx in docs) {
                var doc = docs[ idx];

                var uri = replaceUriAlias( doc.link);
                uris[ uri] = {
                    lang: doc.lang
                    ,category: doc.category
                    ,lastActive: new Date( doc.last_active)
                };
                delete( doc);
            }
            delete( docs);
            log.info( 'load %s uri', Object.keys( uris).length);

            updateList();
            setInterval( updateList, config.get( 'parse:interval')).unref();
        })
    }


    //load follow statistic
    function loadStatistic(){
        BloggerWidgetVisitedModel.find().lean().exec( function( err, docs) {

            if( err){ log.error( err); throw new Error}

            for( var idx in docs) {

                var doc = docs[ idx];

                var data = {
                    from: getMainBlogUri( doc.fromUrl)
                    ,to: getMainBlogUri( doc.toUrl)
                }
                delete( doc);

                for( var idx in data) {

                    var link = replaceUriAlias( data[ idx]);
                    if( ! link) {
                        continue;
                    }

                    if( typeof follow[ link] == 'undefined') {
                        follow[ link] = { in: 0, out: 0}
                    }

                    if( idx == 'from') {
                        follow[ link].out++;
                    } else {
                        follow[ link].in++;
                    }
                }
                delete( data);
            }
            delete( docs);

            log.info( 'load %s follow', Object.keys( follow).length);
        })
    }
}


function updateList() {

	lastParse = new Date();
	log.info( 'update list of blogs');

    var uriInParse = Object.keys( uris);

	async.map(
        uriInParse
		,function( uri, callback) {

			var rssUri = uri +'feeds/posts/default?max-results=1';

			log.info( 'parse `%s`', rssUri );
            request( rssUri, function ( err, res, xml) {

                if( err) {
                    log.warn( 'cant get `%s`', rssUri);
                    moveToBrokenUri( uri);
                    callback( null, null);
                    delete( res);
                    return;
                }

                if( res.statusCode != 200) {
                    log.warn( 'Bad status code `%s`, for `%s`', res.statusCode, rssUri);
                    moveToBrokenUri( uri);
                    callback( null, null);
                    delete( res);
                    return;
                }
                delete( res);

                parseXml( xml, {trim: true}, function ( err, rss) {
                    delete( xml);
                    if( err) {

                        log.warn( 'cant parse xml in `%s`', rssUri);
                        moveToBrokenUri( uri);
                        delete( rss);
                        callback( null, null);
                        return;
                    }

                    if( ! ( rss && rss[ 'feed'])) {

                        log.warn( 'broken xml in `%s`', rssUri);
                        delete( rss);
                        moveToBrokenUri( uri);
                        callback( null, null);
                        return;
                    }

                    var link = '';
                    for( var idx in rss.feed.link) {
                        var link = rss.feed.link[ idx]['$']
                            , rel = link.rel
                            , href = link.href

                        if ( rel == 'alternate') {
                            link = href;
                            break;
                        }
                    }


                    var category = uris[ uri].category
                        ,lang = uris[ uri].lang
                        ,post = rss.feed.entry[0];

                    //set title
                    if( typeof post.title[0]._ != 'undefined') {
                        var title = post.title[0]._;
                    } else {
                        var title = post.published[0];
                        title = new Date( title);
                        title = title.toFormat( 'YYYY-MM-DD HH:MI')
                    }

                    //set content
                    if( typeof post.content != 'undefined') {
                        var content = post.content[ 0]._;
                    } else {
                        var content = title;
                    }

                    var blog = {
                        author: {
                            name: rss.feed.author[ 0].name[ 0]
                            , email: rss.feed.author[ 0].email[ 0]
                        }
                        ,link: link
                        ,title: rss.feed.title[ 0]._
                        ,post: {
                            title: title
                            ,published: post.published[0]
                            ,content: content
                        }
                        ,params: {
                            uri: uri
                            ,category: category
                            ,lang: lang
                            ,lastActive: uris[ uri].lastActive
                        }
                    }
                    delete( rss);

                    callback( null, blog);
                });
            });
            delete( rssUri);
		}
		,function( err, results) {

			if( err) { log.error( err); return; }

            results = results.filter( function( el){
                return el !== null;
            })

			blogs = results.sort( function( a, b) {

				var dateA = new Date( a.post.published)
					,dateB = new Date( b.post.published)

				if( dateA > dateB) {
					return -1;
				} else if( dateA < dateB) {
					return 1;
				}

				return 0;
			});
            delete( result);
		}
	);
    delete( uriInParse);
}


function moveToBrokenUri( uri) {

    brokenUris[ uri] = uris[ uri]
    delete( uris[ uri]);

}


function updateActiveBlog( uri, params) {

    var link = getMainBlogUri( uri);
    delete( uri);

    if( link == null){
        log.warn( 'unknown blog %s', uri);
        delete( link);
        delete( params);
        return;
    }

	var now = new Date();

    if( params.category != config.get( 'product:blogger_widget:super_category')) {
        update.category = params.category;
    }

    if( typeof uris[ link] == 'undefined'){
        uris[ link] = {
            lang: params.lang
            ,category: params.category
            ,lastActive: now.clone()
        }
    }

    var condition = { link: link}
        ,update = {
            last_active: now.toString()
            ,lang: params.lang
        }

    delete( link);
    delete( params);
    delete( now);

    process.nextTick( function(){

        BloggerWidgetModel.findOneAndUpdate( condition, update, { upsert: true}, function( err) {
            delete( condition);
            delete( update);

            if( err){ log.error( err); return;}

            log.info( 'Blog ' + link + ' update active');
        });
    })
}


function updateFollow( from, to, userIp, headers) {

    /*
    BloggerWidgetVisitedModel.create(
        {
            fromUrl         : from
            ,toUrl          : to
            ,ipAddressUser  : userIp
            ,headers        : headers
        }
        ,function( err){
            if( err){ log.error( err); return;}
        }
    );
     */

    //update cache
    var data = {
        from: getMainBlogUri( from)
        ,to: getMainBlogUri( to)
    }

    for( var idx in data) {

        var link = data[ idx];
        if( ! link) {
            continue;
        }

        if( typeof follow[ link] == 'undefined') {
            follow[ link] = { in: 0, out: 0}
        }

        if( idx == 'from') {
            follow[ link].out++;
        } else {
            follow[ link].in++;
        }
    }
}


function list( params, exclude, limit) {

    if( typeof exclude == 'undefined') {
        exclude = null;
    } else {
        exclude = getMainBlogUri( exclude);
    }

    if( typeof params == 'undefined') {
        params = null
    }

    var filterBlog = blogs.filter( function( el){

        var result = null;

        //params test
        result = (
            params == null
            || el.params.category == config.get( 'product:blogger_widget:super_category')
            || ( el.params.category == params.category && el.params.lang == params.lang)
        );

        //exclude uri test
        result = result && ( exclude == null || el.params.uri != exclude);

        return result;
    });


    if( typeof limit != 'undefined') {
        filterBlog = filterBlog.slice( 0, limit);
    }

    //add follow
    for( var idx in filterBlog) {

        var link = filterBlog[ idx].link

        if( typeof follow[ link] != 'undefined') {

            filterBlog[ idx][ 'follow'] = follow[ link]
        } else {

            filterBlog[ idx][ 'follow'] = { in: 0, out: 0}
        }
    }

	return filterBlog;
};


function uriList() {

    var data = JSON.stringify( uris)
    data = JSON.parse( data);

	return data;
};


function brokenUriList() {

    var data = JSON.stringify( brokenUris)
    data = JSON.parse( data);

    return data;
};


function lastParseTime() {
	return lastParse;
};


function inactiveWidgets() {
    var inactive = []
        ,allBlog = list()
        ,now = new Date()

    inactive = allBlog.filter( function( blog){
        var lastActive = blog.params.lastActive
            ,between = lastActive.getDaysBetween( now);
        return between > 21;
    });

    var data = JSON.stringify( inactive)
    data = JSON.parse( data);

    return data;
}


function addAliasBlog( alias, host) {

    if( typeof aliasUris[ alias] != 'undefined') {
        log.warn( 'Alias `%s` is exist', alias);
        delete( alias);
        delete( host);
        return;
    }

    BloggerWidgetAliasModel.create(
        {
            alias           : alias
            ,host           : host
        }
        ,function( err){
            if( err){ log.error( err); return;}
        }
    );

    aliasUris[ alias] = host;

    //remove alias info
    if( typeof uris[ alias] != 'undefined') {

        if( typeof uris[ host] == 'undefined') {
            uris[ host] = uris[ alias]
        }

        delete( uris[ alias]);
    }
    else if( typeof brokenUris[ alias] != 'undefined') {
        delete( brokenUris[ alias]);
    }

    if( typeof blogs[ alias] != 'undefined') {
        if( typeof blogs[ host] == 'undefined') {
            blogs[ host] = blogs[ alias]
        }

        delete( blogs[ alias]);
    }


    //calculate follows
    if( typeof follow[ host] == 'undefined') {
        follow[ host] = { in: 0, out: 0}
    }

    if( typeof follow[ alias] != 'undefined') {

        follow[ host].in+= follow[ alias].in;
        follow[ host].out+= follow[ alias].out;

        delete( follow[ alias]);
    }
}

module.exports.up = up;
module.exports.list = list;
module.exports.uriList = uriList;
module.exports.brokenUriList = brokenUriList;
module.exports.inactiveWidgets = inactiveWidgets;
module.exports.updateList = updateList;
module.exports.updateActiveBlog = updateActiveBlog;
module.exports.lastParseTime = lastParseTime;
module.exports.updateFollow = updateFollow;
module.exports.addAliasBlog = addAliasBlog;