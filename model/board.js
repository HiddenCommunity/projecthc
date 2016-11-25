var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
    category: String,
    author: String,
    title: String,
    body: String,
    date: { type: Date, default: Date.now },
//    tag : [],
    meta: {
        hit: {type:Number, default:0},
        like: {type:Number, default:0},
        hate: {type:Number, default:0}
    },
    comment: [{
        author: String,
        body: String,
        date: Date,
        like: {type:Number, default:0},
        hate: {type:Number, default:0}
    }]
});

module.exports = mongoose.model('Board', boardSchema);