var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    nickname: String,
    connectKey: String,
    majors: [{category: String}],
    join_date: { type: Date, default: Date.now },
    last_login_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);