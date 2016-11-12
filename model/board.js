var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
    category: String,
    author: String,
    title: String,
    body: String,
    date: { type: Date, default: Date.now },
    meta: {
        hit: Number,
        like: Number,
        hate: Number
    },
    comments: [{
        author: String,
        body: String,
        date: Date,
        like: Number,
        hate: Number
    }]
});

module.exports = mongoose.model('board', boardSchema);