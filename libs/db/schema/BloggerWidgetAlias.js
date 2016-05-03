var mongoose	= require( 'mongoose');
var Schema		= mongoose.Schema;

var BloggerWidgetAliasSchema = new Schema({
    alias: {
        type: String
        ,required: true
    },
    host: {
        type: String
        ,required: true
    }
}, { autoIndex: false});

var BloggerWidgetAliasModel = mongoose.model( 'BloggerWidgetAlias', BloggerWidgetAliasSchema);
module.exports = BloggerWidgetAliasModel;