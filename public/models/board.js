var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
    category: String,
    writer: String,
    title: String,
    content: String,
    write_date: { type: Date, default: Date.now },
    hit: Number,
    like: Number,
    hate: Number,
    comments: [{writer: String,
                content: String,
                write_date: { type: Date, default: Date.now },
                hit:Number,
                like:Number,
                hate:Number
    }]
});

//모듈화
module.exports = mongoose.model('board', boardSchema);