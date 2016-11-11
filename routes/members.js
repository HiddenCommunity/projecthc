var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

//controller 에 들어오는 모든 요청은 use() 를 통과한다.
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

// members 에 대한 REST
// http://localhost:3000/members
router.route('/')
    //회원가입
    .post(function(req, res){
        var nickname = req.body.nickname;
        var connectKey = req.body.connectKey;
        var majors = new Array();
        for(var i=0; i<req.body.majors.length; i++){
            majors[i] = req.body.majors[i];
        };
        var join_date = new Date();
        var last_login_date = new Date();
        //멤버 추가하는 함수
        .mongoose.model('Member').create({
            nickname : nickname,
            connectKey : connectKey,
            majors : majors,



        }
    }