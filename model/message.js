var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var msgSchema = new Schema({
    recipient: String,
    sender: String,
    body: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', msgSchema);