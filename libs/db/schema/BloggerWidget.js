var mongoose	= require( 'mongoose');
var Schema		= mongoose.Schema;

var BloggerWidgetSchema = new Schema({
    created: {
		type: Date
		,default: Date.now
	}
	,last_active: {
		type: Date
		,default: Date.now
	}
    ,link: {
		type: String
		,unique: true
        ,required: true
	}
    ,category: {
        type: Number
        ,required: true
        ,default: 1
    }
    ,lang: {
        type: String
        ,enum: [ 'en', 'ru']
        ,default: 'en'
        ,required: true
    }
}, { autoIndex: false});

var BloggerWidgetModel = mongoose.model( 'BloggerWidget', BloggerWidgetSchema);

module.exports = BloggerWidgetModel;