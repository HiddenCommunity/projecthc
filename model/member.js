var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    email: String,
    nickname: String,
    password : String,
    connectKey: String,
    major1 : String,
    major2 : String,
    major3 : String,
    join_date: { type: Date, default: Date.now },
    last_login_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);