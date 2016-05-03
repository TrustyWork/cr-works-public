                        require( 'date-utils');

var config				= require( 'config')
	,log         		= require( 'libs/log')( module)
	,cookieParser		= require( 'cookie-parser')
	,bodyParser			= require( 'body-parser')
	,methodOverride		= require( 'method-override')
	,logger				= require( 'morgan')
	,ejs				= require( 'ejs-locals')
	,session			= require( 'libs/db').session
	,path				= require( 'path')
	,favicon			= require( 'serve-favicon')
	,i18n				= require( 'i18n')
	,less				= require( 'less-middleware')
	,express			= require( 'express')
	,app				= express()

var sendHttpError		= require( 'server/middleware/sendHttpError')
	,renderPage			= require( 'server/middleware/renderPage')
	,lang				= require( 'server/middleware/lang')
	,server				= require( 'server')


var listCore			= require( 'core/list');


// template`s engine setup
app.engine( 'ejs', ejs);
app.set( 'views', path.join( __dirname, 'views'));
app.set( 'view engine', 'ejs');
app.use( favicon( path.join( __dirname, 'public/favicon.png')));
app.use( less( path.join( __dirname, 'public')));
app.use( express.static( path.join( __dirname, 'public')));

app.use( renderPage);

//logger setup
if ( app.get( 'env') == 'development') {
	app.use( logger( 'dev'));
} else {
	app.use( logger( 'combined'));
}

app.use( methodOverride());
app.use( cookieParser());
app.use( bodyParser.urlencoded( { extended: true}));

//session
app.use( session);


//i18n
i18n.configure({
	locales: config.get( 'translate:list')
	,defaultLocale: config.get( 'translate:default')
	,directory: path.join( __dirname, 'locales')
	,cookie: 'lang'
	,updateFiles: false
});
app.use( i18n.init );

app.use( sendHttpError);

//lang switcher and other
app.use( lang);


//service up
listCore.up();
server.up( app);
