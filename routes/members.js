var express = require('express'),
    router = express.Router(),  //Create new router object
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override');  //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

//build the REST operations at the base for members
router.route('/')
//GET all members
    .get(function(req, res, next) {
        //retrieve all members from Mongo
        mongoose.model('member').find({}, function (err, members) {
            if (err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                //res.format({
                //HTML response will render the index.jade file in the views/members folder. We are also setting "members" to be an accessible variable in our jade view
                //html: function(){
                //res.render('members/index', {
                //    title: 'All my members',
                //   "member" : members
                //    });
                //   },
                //JSON response will show all members in JSON format
                //    json: function(){
                res.json(members);
            }
        });
    }

    //POST 회원 추가 (회원가입 form 에서 데이터가 넘어옴)
    .post(function(req, res) {
        var nickname = req.body.nickname;  //form 의 "name" 속성
        var join_date = Date.now();

        //call the create function for our database
        mongoose.model('member').create({
            nickname : nickname,
            join_date : join_date
        }, function (err, member) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //member 생성 성공
                console.log('POST creating new member: ' + member);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("members");
                        // And forward to success page
                        res.redirect("/members");
                    },
                    //JSON response will show the newly created member
                    json: function(){
                        res.json(member);
                    }
                });
            }
        })
    })
    )
    // 회원가입 페이지
    router.get('/new', function(req, res) {
        //렌더링할 라우트. /new 요청을 하면, view/members/new.jade 파일이 HTML형식으로 렌더링된다.
        res.render('members/new', { title: 'Hidden Community !' });
    });

    // route middleware :id 검증
  router.param('id', function(req, res, next, id) {
     console.log('validating ' + id + ' exists');
     //find the ID in the Database
      mongoose.model('member').findById(id, function (err, member) {
         //해당하는 id가 없을 때,
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
         //해당 id인 유저를 찾으면 계속
         } else {
             console.log(member);
             // once validation is done save the new item in the req
             req.id = id;
             // go to the next thing
             next();  //다음 라우트로
         }
     });
  });

  router.route('/:id')
     .get(function(req, res) {
         mongoose.model('member').findById(req.id, function (err, member) {
             if (err) {
                 console.log('GET Error: There was a problem retrieving: ' + err);
             } else {
                 console.log('GET Retrieving ID: ' + member._id);
                 var nickname = member.nickname;
                 var connectKey = member.connectKey;
                 var majors = member.majors;
                 var join_date = member.join_date;
                 var last_login_date = member.last_login_date;

                 res.format({
                     html: function(){
                         res.render('members/show', {
                             "nickname" : nickname,
                             "connectKey" : connectKey,
                             "majors" : majors,
                             "join_date" : join_date,
                             "last_login_date" : last_login_date
                         });
                     },
                     json: function(){
                         res.json(member);  //JSON형태로 반환해줌.
                     }
                 });
             }
         });
     });

 router.route('/:id/edit')
 //GET Mongo ID로 member 1명 찾음
    .get(function(req, res) {
         //search for the member within Mongo
        mongoose.model('member').findById(req.id, function (err, member) {
             if (err) {
                 console.log('GET Error: There was a problem retrieving: ' + err);
             } else {
                 //Return the member
                 console.log('GET Retrieving ID: ' + member._id);
                 var nickname = member.nickname;
                 var join_date = member.join_date;
                 var majors = member.majors;
                 var last_login_date = member.last_login_date;

                 res.format({
                     //HTML response will render the 'edit.jade' template
                     html: function(){
                         res.render('members/edit', {
                             title: 'Member' + member._id,
                                    "member" : member
                             });
                     },
                     //JSON response will return the JSON output
                     json: function(){
                         res.json(member);
                     }
                 });
             }
         });
     })

     //PUT member ID 닉네임 업데이트
    .put(function(req, res) {
         // Get our REST or form values. These rely on the "name" attributes
         var nickname = req.body.nickname;
         //var majors = req.body.majors;

         //find the document by ID
        mongoose.model('member').findById(req.id, function (err, member) {
             //update it
             member.update({
                 nickname : nickname
             }, function (err, memberID) {
                 if (err) {
                     res.send("There was a problem updating the information to the database: " + err);
                 }
                 else {
                    //성공했다는 것을 알려주는 페이지
                     res.json({
                         html: function(){
                             res.redirect("/members/" + member._id);
                         },
                         //JSON responds showing the updated values
                         json: function(){
                             res.json(member);
                         }
                     });
                 }
             })
         });
     });

module.exports = router;