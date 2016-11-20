var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = new Schema({
    cookie : {
        maxAge : Number
    }
});

module.exports = mongoose.model('Session', sessionSchema);