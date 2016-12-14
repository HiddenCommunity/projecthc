var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noticeSchema = new Schema({
    boardId : String,
    boardAuthor : String,
    actionAuthor : String,
    type : String,
    check : { type: Boolean, default: false },
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Notice', noticeSchema);