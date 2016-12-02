var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    //email: {type : String, unique : true}, 제대로 할 때는 이렇게 바꿔야함.
    //nickname: {type : String, unique : true},
    email: String,
    nickname: String,
    password : String,
    major1 : String,
    major2 : String,
    major3 : String,
    join_date: { type: Date, default: Date.now }
    //last_login_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);