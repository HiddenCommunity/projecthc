var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noticeSchema = new Schema({
    boardId : String,
    boardAuthor : String,
    actionAuthor : String,
    type : String,
    check : { type: Boolean, default: false }
});

module.exports = mongoose.model('Notice', noticeSchema);