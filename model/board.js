var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
    category: String,
    writer: {type: Schema.Types.ObjectId, ref:'Member'},
    title: String,
    content: String,
    write_date: { type: Date, default: Date.now },
    hit: 0,
    like: 0,
    hate: 0,
    comments: [{writer: String,
                content: String,
                write_date: { type: Date, default: Date.now },
                hit:0,
                like:0,
                hate:0
    }]
});

module.exports = mongoose.model('board', boardSchema);