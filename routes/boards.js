var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

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
}))

//build the REST operations at the base for members
router.route('/')
//GET 모든 게시글 조회
    .get(function(req, res, next) {
        mongoose.model('Board').find({}, function (err, boards) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    html: function(){
                        res.render('boards/index', {
                            title: 'All boards',
                            "board" : boards
                        });
                    },
                    //JSON response will show all members in JSON format
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
        var writer = req.body.writer;
        var title = req.body.title;
        var content = req.body.content;
        var write_date = req.body.write_date;

        // var comments = [{writer: String,
        //     content: String,
        //     write_date: { type: Date, default: Date.now },
        //     hit = 0;
        //     like = 0;
        //     hate = 0;

        //call the create function for our database
        mongoose.model('Board').create({
            category : category,
            writer : writer,
            title : title,
            content : content,
            write_date : write_date,
            hit : 0,
            like : 0,
            hate : 0
        }, function (err, board) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //게시글 생성 성공
                console.log('POST creating new Boardr: ' + board);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        res.location("boards");
                        res.redirect("/boards");
                    },
                    //JSON response will show the newly created member
                    json: function(){
                        res.json(board);
                    }
                });
            }
        })
    });

/* GET New board page. */
router.get('/new', function(req, res) {
    res.render('boards/new', { title: 'Add New board' });
});
//
// // route middleware to validate :id
// router.param('id', function(req, res, next, id) {
//     //console.log('validating ' + id + ' exists');
//     //find the ID in the Database
//     mongoose.model('member').findById(id, function (err, member) {
//         //if it isn't found, we are going to repond with 404
//         if (err) {
//             console.log(id + ' was not found');
//             res.status(404)
//             var err = new Error('Not Found');
//             err.status = 404;
//             res.format({
//                 html: function(){
//                     next(err);
//                 },
//                 json: function(){
//                     res.json({message : err.status  + ' ' + err});
//                 }
//             });
//             //if it is found we continue on
//         } else {
//             //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
//             //console.log(member);
//             // once validation is done save the new item in the req
//             req.id = id;
//             // go to the next thing
//             next();
//         }
//     });
// });
//
// router.route('/:id')
//     .get(function(req, res) {
//         mongoose.model('member').findById(req.id, function (err, member) {
//             if (err) {
//                 console.log('GET Error: There was a problem retrieving: ' + err);
//             } else {
//                 console.log('GET Retrieving ID: ' + member._id);
//                 var memberjoin_date = member.join_date.toISOString();
//                 memberjoin_date = memberjoin_date.substring(0, memberjoin_date.indexOf('T'))
//                 res.format({
//                     html: function(){
//                         res.render('members/show', {
//                             "join_date" : join_date,
//                             "member" : member
//                         });
//                     },
//                     json: function(){
//                         res.json(member);
//                     }
//                 });
//             }
//         });
//     });
//
// router.route('/:id/edit')
// //GET the individual member by Mongo ID
//     .get(function(req, res) {
//         //search for the member within Mongo
//         mongoose.model('member').findById(req.id, function (err, member) {
//             if (err) {
//                 console.log('GET Error: There was a problem retrieving: ' + err);
//             } else {
//                 //Return the member
//                 console.log('GET Retrieving ID: ' + member._id);
//                 var memberjoin_date = memberjoin_date.dob.toISOString();
//                 memberjoin_date = memberjoin_dateb.substring(0, blobdob.indexOf('T'))
//                 res.format({
//                     //HTML response will render the 'edit.jade' template
//                     html: function(){
//                         res.render('members/edit', {
//                             title: 'Member' + member._id,
//                             "memberjoin_date" : memberjoin_date,
//                             "blob" : blob
//                         });
//                     },
//                     //JSON response will return the JSON output
//                     json: function(){
//                         res.json(blob);
//                     }
//                 });
//             }
//         });
//     })
//     //PUT to update a blob by ID
//     .put(function(req, res) {
//         // Get our REST or form values. These rely on the "name" attributes
//         var name = req.body.name;
//         var badge = req.body.badge;
//         var dob = req.body.dob;
//         var company = req.body.company;
//         var isloved = req.body.isloved;
//
//         //find the document by ID
//         mongoose.model('Member').findById(req.id, function (err, member) {
//             //update it
//             member.update({
//                 name : name,
//                 badge : badge,
//                 dob : dob,
//                 isloved : isloved
//             }, function (err, blobID) {
//                 if (err) {
//                     res.send("There was a problem updating the information to the database: " + err);
//                 }
//                 else {
//                     //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
//                     res.format({
//                         html: function(){
//                             res.redirect("/blobs/" + blob._id);
//                         },
//                         //JSON responds showing the updated values
//                         json: function(){
//                             res.json(blob);
//                         }
//                     });
//                 }
//             })
//         });
//     })
//     //DELETE a member by ID
//     .delete(function (req, res){
//         //find member by ID
//         mongoose.model('Member').findById(req.id, function (err, member) {
//             if (err) {
//                 return console.error(err);
//             } else {
//                 //remove it from Mongo
//                 member.remove(function (err, member) {
//                     if (err) {
//                         return console.error(err);
//                     } else {
//                         //Returning success messages saying it was deleted
//                         console.log('DELETE removing ID: ' + member._id);
//                         res.format({
//                             //HTML returns us back to the main page, or you can create a success page
//                             html: function(){
//                                 res.redirect("/members");
//                             },
//                             //JSON returns the item with the message that is has been deleted
//                             json: function(){
//                                 res.json({message : 'deleted',
//                                     item : member
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     });

module.exports = router;





// module.exports = function(app, Member, Board) {
//   // 회원가입 addMember
//   app.post('/api/members', function (req, res) {
//     var member = new Member();
//     member.nickname = req.body.nickname;
//     member.connectKey = "abcdfadfadfd";  //원래 서버에서 생성해줘야함.
//     member.majors = new Array(req.body.majors);
//     member.join_date = new Date(req.body.join_date);
//     member.last_login_date = new Date(req.body.join_date);
//
//     member.save(function (err) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       res.json({result: 1});
//     });
//   });
//
//   app.get('/api/members/', function(req, res){
//     Member.find({}, function(err, members){
//       if(err) return res.status(500).json({error:err});
//       if(members.length===0) return res.status(404).json({error:'member not found'});
//       res.json(members);
//     });
//   });
//
//   //게시글 작성
//   app.post('/api/boards', function (req, res) {
//     var board = new Board();
//     board.nickname = req.body.nickname;
//     board.connectKey = "abcdfadfadfd";  //원래 서버에서 생성해줘야함.
//     board.majors = new Array(req.body.majors);
//     board.join_date = new Date(req.body.join_date);
//     board.last_login_date = new Date(req.body.join_date);
//
//     board.save(function (err) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       res.json({result: 1});
//     });
//   });
//
//   // 게시판 _id 값으로 전공별 게시판 조회
//   // app.get('/api/boards/:board_id', function(req, res){
//   //   res.end();
//   // });
//   //
//   // // 게시글 작성
//   // app.post('/api/boards', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // // 게시글 수정
//   // app.put('/api/boards/:board_id', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // // 게시글 삭제
//   // app.delete('/api/boards/:board_id', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // // 댓글 작성
//   // app.post('/api/boards/:board_id/comments', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // // 댓글 수정
//   // app.put('/api/boards/:board_id/comments/:comments_id', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // // 댓글 삭제
//   // app.delete('/api/boards/:board_id/comments/:comments_id', function(req, res){
//   //   res.send('OK');
//   // });
//   //
//   // //작성자로 게시글 조회 (내가 쓴글 보기)
//   // app.get('/api/boards/:user_id', function(req, res){
//   //   res.send('OK');
//   // })
//
// }