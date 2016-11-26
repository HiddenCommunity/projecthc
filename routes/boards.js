var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose'),
    session = require('express-session');

/*
* [게시판 기능]
* 게시글 리스트 : 게시판DB에서 카테고리가 "  "인 글들을 모두 불러온다.
* C:세션에서 member_id를 받아옴 -> member_id값으로 회원db에서 해당하는 회원 찾기 -> 그 회원의 name 이 게시글 작성자
* R:게시글을 눌렀을 때 게시글_id로 게시판db에서 글 하나 찾기, 조회수 +1
* U:R->업뎃
* D:R->삭제
* 좋아요:R->좋아요수 +1
* 신고:R->신고수 +1
* 댓글:
* 조회수 많은 글 맨위에 보여주기
* */

//CREATE
route.route('/new')
    .get(function(req, res){
        res.render('boards/new');
    })
    .post(function(req,res){
    //     var category = req.body.major;
    //     var author = req.body.author;
    //     var title = req.body.title;
    //     var body = req.body.body;
    //     var tagArr = req.body.tag.split(' ');

        var category = req.query.major;
        var author = req.query.author;
        var title = req.query.title;
        var body = req.query.body;
        var tagArr = req.query.tag.split(' ');
        console.log(tagArr);

        mongoose.model('Board').create({
            category : category,
            author : author,
            title : title,
            body : body,
            tag : tagArr
        }, function (err, board) {
            if (err) {
                res.send("[error] 게시글 작성 실패");
                console.log('실패');
            } else { //게시글 생성 성공
                console.log('POST 게시글 작성 성공 ' + board._id);
                //console.log(typeof  board._id);
                //console.log(typeof board._id.toString());
                var id = board._id.toString();
                res.json(
                    {response : id});
                //console.log(board);
            }
        });
    });

//LIST
route.route('/list/:major')
    .get(function(req, res) {
        var major = req.params.major;
        mongoose.model('Board').find({category: major}).sort({date: -1}).exec(function (err, boards) {
            //db에서 날짜 순으로 데이터들을 가져옴
            if (err) {
                return console.error(err);
            } else {
                res.render('boards/index', {title: major,"boards": boards});
            }
        })
    })
    //안드로이드에서 전공별 게시판 볼때
    .post(function(req, res) {
        var major = req.query.major;
        mongoose.model('Board').find({category: major}).sort({date: -1}).exec(function (err, boards) {
            //db에서 날짜 순으로 데이터들을 가져옴
            if (err) {
                return console.error(err);
            } else {
                res.json(boards);
            }
        })
    })

//READ
route.route('/read/:id')
    .get(function(req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('[실패] 게시글 읽기 실패 에러 : ' + err);
            } else {
                console.log('[성공] 검색한 게시글 ID: ' + board._id);
                board.meta.hit += 1; //조회수 +1
                console.log('[성공] 조회수 업데이트. 현재 조회수 : ' + board.meta.hit);
                console.log(typeof board);
                var boardObj = JSON.stringify(board);
                res.json(boardObj);
            }
        })
    })
    .post(function(req, res){
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('[실패] 게시글 읽기 실패 에러 : ' + err);
            } else {
                console.log('[성공] 검색한 게시글 ID: ' + board._id);
                board.meta.hit += 1; //조회수 +1
                console.log('[성공] 조회수 업데이트. 현재 조회수 : ' + board.meta.hit);
                //var boardObj = JSON.parse(board);
                res.json({board : board});
            }
        })
    })

// req.param 중에 id가 있을 때,에러 체킹 :id 를 가지고 db에 들어있는지 확인.
// route.param('id', function(req, res, next, id) {
//     console.log('validating ' + id + ' exists');
//     //db에서 해당 id를 찾는다.
//     mongoose.model('Board').findById(id, function (err, board) {
//         //db에 그 id가 없으면 404
//         if (err) {
//             console.log(id + ' was not found');
//             res.status(404);
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
//             //해당 id를 찾으면 req.id에 저장하고 계속 쓴다.
//         } else {
//             console.log(board);
//             // validation 완료되면 새 item(board)를 req에 저장한다.
//             req.id = id;
//             next();
//         }
//     });
// });
//

//
//
// //글 수정
// // /boards/edit/582674abcdf9fa75d82270d9
// route.post('/edit/:id', function(req, res) {
//     var newTitle = req.query.title;
//     var newBody = req.query.body;
//     var newDate = Date.now();
//     var board_id = req.id;
//     // ID 로 해당 board 찾기
//     mongoose.model('Board').findById(board_id, function (err, board) {
//         board.update({
//             title: newTitle,
//             body: newBody,
//             date: newDate
//         }, function (err, board) {
//             if (err) {
//                 res.send("[실패] Updating 실패: " + err);
//             } else {
//                 res.json(board);
//             }
//         })
//     })
// })
//
// route.post('/delete/:id', function(req, res) {
//     //find member by ID
//     var board_id = req.id;
//     mongoose.model('Board').findById(board_id, function (err, board) {
//         if (err) {
//             return console.error(err);
//         } else {
//             board.remove(function (err, board) {
//                 if (err) {
//                     return console.error(err);
//                 } else {
//                     console.log('DELETE removing ID: ' + board._id);
//                     res.json({message: 'deleted', item: board});
//                 }
//             })
//         }
//     })
// })

module.exports = route;