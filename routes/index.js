var express = require('express'),
    app = express(),
    router = express.Router(),  //Create new router object
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'),  //used to manipulate POST
    nodemailer = require('nodemailer');

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
router.route('/members')
//GET all members
    .get(function(req, res, next) {
      //retrieve all members from Mongo
      mongoose.model('Member').find({}, function (err, members) {
        if (err) {
          return console.error(err);
        } else {
          //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
          res.format({
            // html: function(){
            // res.render('members/index', {
            //     title: 'All my members',
            //    "member" : members
            //     });
            //    },
            json: function(){
              res.json(members);
            }
          });
        }
      });
    })

    //POST 회원 추가 (회원가입 form 에서 데이터가 넘어옴)
    .post(function(req, res) {
      var nickname = req.body.nickname;  //form 의 "name" 속성
      var join_date = Date.now();

      //call the create function for our database
      mongoose.model('Member').create({
        nickname : nickname,
        join_date : join_date
      }, function (err, member) {
        if (err) {
          res.send("There was a problem adding the information to the database.");
        } else {
          //member 생성 성공
          console.log('POST creating new member: ' + member);
          res.format({
            // html: function(){
            //   res.location("members");
            //   res.redirect("/members");
            // },
            json: function(){
              res.json(member);
            }
          });
        }
      })
    })

// 회원가입 페이지
router.get('/members/new', function(req, res) {
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

router.route('/members/:id')
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
            // html: function(){
            //   res.render('members/show', {
            //     "nickname" : nickname,
            //     "connectKey" : connectKey,
            //     "majors" : majors,
            //     "join_date" : join_date,
            //     "last_login_date" : last_login_date
            //   });
            // },
            json: function(){
              res.json(member);  //JSON형태로 반환해줌.
            }
          });
        }
      });
    });

router.route('/members/:id/edit')
//GET Mongo ID로 member 1명 찾음
    .get(function(req, res) {
      //search for the member within Mongo
      mongoose.model('Member').findById(req.id, function (err, member) {
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
            // html: function(){
            //   res.render('members/edit', {
            //     title: 'Member' + member._id,
            //     "member" : member
            //   });
            // },
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
      mongoose.model('Member').findById(req.id, function (err, member) {
        //update it
        member.update({
          nickname : nickname
        }, function (err, member) {
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

//http://52.78.207.133:3000/boards/
router.route('/boards')
//GET DB에서 모든 게시글 조회
    .get(function(req, res, next) {
      mongoose.model('Board').find({}, function (err, boards) {
        if (err) {
          return console.error(err);
        } else {
          res.format({
            html: function(){
              res.render('boards/index', {
                title: '모든 게시글',
                "boards" : boards
              });
            },
            json: function(){
              res.json(boards);
            }
          });
        }
      });
    })
    //POST 새 게시글 작성
    .post(function(req, res) {
      var category = req.body.category;
      var author = req.body.author;
      var title = req.body.title;
      var body = req.body.body;
      var date = req.body.date;

      mongoose.model('Board').create({
        category : category,
        author : author,
        title : title,
        body : body,
        date : date,
        meta : {
          hit:0,
          like:0,
          hate:0
        },
        comments : []
      }, function (err, board) {
        if (err) {
          res.send("[실패] 새 board 추가 실패");
        } else {
          //게시글 생성 성공
          console.log('POST [성공] 새 board 추가 성공! : ' + board);
          res.format({
            html: function(){
              res.location("boards");//home으로
              res.redirect("/boards");  //index.jade로 -> 수정,삭제,보여주기
            },
            //JSON response will show the newly created member
            json: function(){
              res.json(board);
            }
          });
        }
      })
    });

// http://52.78.207.133:3000/boards/new   ->new.jade 입력폼
router.get('/boards/new', function(req, res) {
  res.render('boards/new', { title: '새 글 작성하기' });
});

// 에러 체킹 :id 를 가지고 db에 들어있는지 확인.
router.param('id', function(req, res, next, id) {
  console.log('validating ' + id + ' exists');
  //db에서 해당 id를 찾는다.
  mongoose.model('Board').findById(id, function (err, board) {
    //db에 그 id가 없으면 404
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
      //해당 id를 찾으면 req.id에 저장하고 계속 쓴다.
    } else {
      console.log(board);
      // validation 완료되면 새 item(board)를 req에 저장한다.
      req.id = id;
      next();
    }
  });
});

// http://52.78.207.133:3000/boards/582674abcdf9fa75d82270d9
// show.jade
router.route('/boards/:id')
    .get(function(req, res) {
      mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
          console.log('GET [에러]: 검색 실패! ' + err);
        } else {
          console.log('GET [성공] 검색한 ID: ' + board._id);
          res.format({
            html: function(){
              res.render('boards/show', {
                "board" : board
              });
            },
            json: function(){
              res.json(board);
            }
          });
        }
      });
    });

//http://52.78.207.133:3000/boards/582674abcdf9fa75d82270d9/edit
router.route('/boards/:id/edit')
//GET Mongo ID로 board 하나 검색
    .get(function(req, res) {
      mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
          console.log('GET [에러] : 검색 실패! ' + err);
        } else {
          //검색성공하면 해당 board 리턴
          console.log('GET Retrieving ID: ' + board._id);
          //var date = board.date.toISOString();
          //date = date.substring(0, date.indexOf('T'));  날짜만 자름.
          res.format({
            //'edit.jade' 로
            html: function(){
              res.render('boards/edit', {
                title: 'Board' + board._id,
                //"memberjoin_date" : memberjoin_date,
                "board" : board
              });
            },
            json: function(){
              res.json(board);
            }
          });
        }
      });
    })

    //PUT ID 로 board UPDATE
    .put(function(req, res) {
      // Get form 의 "name" attributes
      var title = req.body.title;
      var body = req.body.body;
      var date = Date.now();
      // ID 로 해당 board 찾기
      mongoose.model('Board').findById(req.id, function (err, board) {
        board.update({
          title : title,
          body : body,
          date : date
        }, function (err, board) {
          if (err) {
            res.send("[실패] Updating 실패: " + err);
          } else {
            res.format({
              html: function(){
                res.redirect("/boards/" + board._id);
              },
              //JSON responds showing the updated values
              json: function(){
                res.json(board);
              }
            });
          }
        })
      });
    })

    //DELETE ID로 board 삭제
    .delete(function (req, res){
      //find member by ID
      mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
          return console.error(err);
        } else {
          board.remove(function (err, board) {
            if (err) {
              return console.error(err);
            } else {
              console.log('DELETE removing ID: ' + board._id);
              res.format({
                html: function(){
                  res.redirect("/boards"); //index.jade
                },
                json: function(){
                  res.json({message : 'deleted',
                    item : board
                  });
                }
              });
            }
          });
        }
      });
    });

//메일보내기
router.route('/send/email/:email')
    .post(function(req, res){
      var email = req.params.email;
      console.log(email);
      // create reusable transporter object using the default SMTP transport
      var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'carsilverstar@gmail.com', pass: 'a298870a' } });

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"HiddenCommunity" <hc@hiddencommunity.com>', // sender address
        to: email, // list of receivers
        subject: 'Hidden Community 가입 인증메일 ', // Subject line
        html:'<p><img src="./images/logo.png"/></p><h1>HiddenCommunity 가입 인증 메일입니다.</h1><h4>안녕하세요.</h4><h4>Hidden Community 서비스에 가입해주셔서 감사합니다.</h4><h4>아래 링크를 클릭하여 Hidden Community 서비스의 가입 인증을 완료해주세요.</h4><p><a href="http://52.78.207.133:3000/send/email/confirm?email="' +email + '"><img src="./images/auth_btn.png"/></a></p></p>'};

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          res.json(error);
          return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        res.json({response : "ok"});
      });

    });


//이메일 인증메일에서 버튼클릭하면 이쪽으로 온다.
router.route('/send/email/confirm')
    .get(function(req,res){
        var email = req.param('email');
        //디비에 인증된 이메일 등록

        //등록 되었으면 인증 화면을 띄워준다.
        res.end('<h1>HiddenCommunity 인증완료</h1><p><img src="https://i1.wp.com/nodemailer.com/wp-content/uploads/2015/10/n2-2.png?w=422&ssl=1"/></p>');
    });

router.route('send/email/validate')
    .post(function(req,res) {
      var email = req.param('email');
      //디비에 이메일이 인증되어있나 체크.
      
    });

//안드로이드에서 아이디, 패스워드 입력.
router.route('/send/email/info')
    .post(function (req,res) {
      var user_id = req.param('id');
      var user_password = req.param('password');
      console.log(user_id + " " + user_password);
      res.end('{response:"ok"}');
    });
    

module.exports = router;