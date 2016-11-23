var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session),
    store = new MongoDBStore(
        {
            uri : 'mongodb://localhost:27017/hcDB',
            collection : 'sessions'
        }
    );

route.use(cookieParser());
route.use(session({
    secret : '@345a!d^f$h%a12&*#%',  // 암호화 키
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 //쿠키유효기간 : 1주일
    },
    store : store,
    resave : false,  //접속할 때마다 새롭게 발급할 것인지
    saveUninitialized: true
}));

//첫 로딩화면에서 요청해야할 것.
//test:get
route.post('/login', function(req,res) {
   if(req.session.login){ //값이 있으면
       console.log(req.session.login);
       console.log('자동로그인 완료');
       res.json({response:"board"});
       //res.render('boards/new');  //게시판 페이지로 이동
   }else{
       console.log('이메일 계정 입력화면으로 이동');
       res.json({response:"email"});
       //res.render('members/new');  //게시판 페이지로 이동
   }
})
//
// //이메일 계정 입력 <-테스트용
// route.get('/new', function(req, res){
//    //렌더링할 라우트. /new 요청을 하면, view/members/new.jade 파일이 HTML형식으로 렌더링된다.
//    res.render('members/new', { title: 'Hidden Community !' });
// });

//안드로이드에서 아이디, 패스워드 입력.
route.route('/addInfo')
    .get(function (req, res){  //테스트용 코드
        res.render('members/edit', { title: '안드로이드에서 사용자 정보 입력하는 화면' });
    })
    .post(function (req,res){
        console.log("들어왔음");
        var email = req.query.email;
        var nickname = req.body.nickname;
        var major1 = req.param('major1');
        var major2 = req.params.major2;
        var major3 = req.params.major3;
        console.log(email, nickname, major1);
        //이메일을 찾아서
        mongoose.model('Member').findOne({'email': email }, function (err, member) {
            //update it
            member.update({
                nickname : nickname,
                major1 : major1,
                major2 : major2,
                major3 : major3
            }, function (err, member) {  //원래 성공했을 때는 처리해야함.
                if (err) {
                    res.send("[실패] db에 update 실패 !: " + err);
                }
                else {
                    console.log('[성공] 회원 정보 추가/수정 완료!');
                    console.log(req.session.login);
                    req.session.login="ok";  //세션에 변수를 설정해준다.
                    req.session.displayName = nickname;
                    console.log(req.session.login);
                    console.log('세션변수설정완료');
                    console.log(req.session.displayName);
                    res.json({response : "ok"});
                }
            });
        })
    });

// route middleware :nickname 검증  - 닉네임으로 사용자 식별하기 위해서
// 이때 id를 설정해서 다음에도 계속 쓴다. 내 정보 보기, 닉네임 수정 용도
route.param('nickname', function(req, res, next, nickname) {
    console.log('validating ' + nickname + ' exists');
    //find the ID in the Database
    mongoose.model('Member').findOne({'nickname': nickname }, function (err, member) {
        //해당하는 nickname이 없을 때,
        if (err) {
            console.log(id + ' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
            //해당 닉네임인 유저를 찾으면 계속
        } else {
            console.log(member);
            // once validation is done save the new item in the req
             //db의 _id로 사용자를 찾기 위해서.
            // go to the next thing
            next();  //다음 라우트로
        }
    });
});

//닉네임변경할 때 다시 주석지우기
// route.route('/:nickname')
//     .get(function(req, res) {
//         mongoose.model('Member').findOne({'nickname': nickname }, function (err, member) {
//             if (err) {
//                 console.log('GET [실패] 해당 닉네임의 회원 찾기 실패: ' + err);
//             } else {
//                 console.log('GET 해당 닉네임인 회원 ID: ' + member._id);
//                 var nickname = member.nickname;
//                 var connectKey = member.connectKey;
//                 var majors = member.majors;
//                 var join_date = member.join_date;
//                 var last_login_date = member.last_login_date;
//
//                 res.json(member);
//             }
//         })
//     });
//
// route.route('/:id/edit')
// //GET Mongo ID로 member 1명 찾음
//     .get(function(req, res) {
//         //search for the member within Mongo
//         mongoose.model('Member').findById(req.id, function (err, member) {
//             if (err) {
//                 console.log('GET Error: There was a problem retrieving: ' + err);
//             } else {
//                 //Return the member
//                 console.log('GET Retrieving ID: ' + member._id);
//                 var nickname = member.nickname;
//                 var join_date = member.join_date;
//                 var majors = member.majors;
//                 var last_login_date = member.last_login_date;
//
//                 res.json(member);
//             }
//         });
//     })
//     //PUT member ID 닉네임 업데이트
//     .put(function(req, res) {
//         // Get our REST or form values. These rely on the "name" attributes
//         var nickname = req.body.nickname;
//         //var majors = req.body.majors;
//
//         //find the document by ID
//         mongoose.model('Member').findById(req.id, function (err, member) {
//             //update it
//             member.update({
//                 nickname : nickname
//             }, function (err, member) {
//                 if (err) {
//                     res.send("There was a problem updating the information to the database: " + err);
//                 }
//                 else { //성공
//                     res.json(member);
//                 }
//             });
//         })
//     })


module.exports = route;