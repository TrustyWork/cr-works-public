var mongoose	= require( 'mongoose');
var Schema		= mongoose.Schema;

var BloggerWidgetVisitedSchema = new Schema({
    dateTime: {
        type: Date,
        default: Date.now
    },
    ipAddressUser: {
        type: String
        ,required: true
    },
    fromUrl: {
        type: String
        ,required: true
    },
    toUrl: {
        type: String
        ,required: true
    },
    headers: {
        type: Schema.Types.Mixed
        ,required: true
    }
}, { autoIndex: false});

var BloggerWidgetVisitedModel = mongoose.model( 'BloggerWidgetVisited', BloggerWidgetVisitedSchema);

module.exports = BloggerWidgetVisitedModel;