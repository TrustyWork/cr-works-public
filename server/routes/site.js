var config				= require( 'config')
	,log				= require( 'libs/log')(module)
	,listCore			= require( 'core/list')

var async				= require( 'async')


module.exports = function( app) {

	app.get( '/', function( req, res){

		res.renderPage( 'index')
	});


	app.get( '/test', function( req, res){

		var params = {}

		params.sections = [
			{
				id: 1
				,title: "Dev Tools"
				,theme: 'theme-1'
				,items: [
					{
						id: 1
						,title:	"Exchange subscribers"
						,image: "/img/products/logo_1.jpg"
						,content: "The tool automatically invites subscribers to your group"
						,link: "/products/1"
					}
					,{
						id: 2
						,title: "Social auto invite"
						,image: "/img/products/logo_2.jpg"
						,content: "The tool automatically invites subscribers to your group"
						,link: "/products/2"
					}
				]
			}
			,{
				id: 2
				,title: "My other projects"
				,theme: 'theme-2'
				,items: [
					{
						id: 3
						,title: 	"Masters Way"
						,image: "/img/products/logo_3.jpg"
						,content: "“Master’s Way” is an online remake of the well-known “Slave Maker”. Our team initiated making multiple translations of “Slave Maker” and in time received the author’s permission to create “Master’s Way”."
						,link: "/products/3"
						,adult: true
					}
					,{
						id: 4
						,title: 	"Deep Sea"
						,image: "/img/products/logo_4.jpg"
						,content: "I developed this game, studying the engine phaser.io. Nevertheless, the concept of peace came to my mind for a long time, I will continue the series if you like it."
						,link: "/products/4"
						,adult: true
					}
				]
			}
		];

		res.render( 'index2', params);
	});
}