var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose'),
    session = require('express-session');

//CREATE
//테스트용 : POST form에서 넘어오기 때문에 req.body.*** 로 받아야함.
//안드로이드 : POST req.query.*** 로 받고 -> DB에 넣고 -> 새 Board를 생성 -> 성공하면 작성한 board_id를 string으로 만들어서 리턴
route.route('/new')
    .get(function (req, res) {
        res.render('boards/new');
    })
    .post(function (req, res) {
        /*웹테스트용
         var category = req.body.major;
         var author = req.body.author;
         var title = req.body.title;
         var body = req.body.body;
         var tagArr = req.body.tag.split(' ');
         */
        var category = req.query.major;
        var author = req.query.author;
        var title = req.query.title;
        var body = req.query.body;
        var tagArr = req.query.tag.split(' ');
        console.log(tagArr);

        mongoose.model('Board').create({
            category: category,
            author: author,
            title: title,
            body: body,
            tag: tagArr
        }, function (err, board) {
            if (err) {
                res.send("[error] 게시글 작성 실패");
                console.log('[error] 게시글 작성 실패');
            } else { //게시글 생성 성공
                console.log('POST 게시글 작성 성공 ' + board._id);
                var id = board._id.toString();
                res.json({response: id});
            }
        });
    });

//LIST
//테스트용 : 전공게시판 리스트 GET 요청
//안드로이드에서 해당 전공게시판 리스트 GET 요청 ->
route.route('/list/:major')
    .get(function (req, res) {
        var major = req.params.major;

        mongoose.model('Board').find({category: major}).sort({date: -1}).exec(function (err, boards) {
            //db에서 날짜 순으로 데이터들을 가져옴
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    html: function () {
                        res.render('boards/index', {title: major, "boards": boards});
                    },
                    json: function () {
                        res.json({boards: boards});
                    }
                });


            }
        })
    })
    //안드로이드에서 전공별 게시판 볼때
    .post(function (req, res) {
        //var major = req.query.major;
        var major = req.params.major;

        mongoose.model('Board').find({category: major}).sort({date: -1}).exec(function (err, boards) {
            //db에서 날짜 순으로 데이터들을 가져옴
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    json: function () {
                        res.json({boards: boards});
                    }
                });

            }
        })
    });

//READ
//게시글을 눌렀을 때 게시글_id로 게시판db에서 글 하나 찾기, 조회수 +1
route.route('/read/:id')
//안드로이드용
    .get(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('GET [실패] 게시글 읽기 실패 에러 : ' + err);
            } else {
                board.meta.hit += 1; //조회수 +1
                board.save(function (err) { // 변화된 조횟수 저장
                    if (err) throw err;
                    else
                        console.log('GET [성공] 조회수 업데이트. 현재 조회수 : ' + board.meta.hit);
                });
                res.format({
                    //웹 테스트용
                    // html: function(){
                    //     res.render('boards/show', {title: board.title,"board": board});
                    // },

                    json: function () {
                        res.json({board: board});
                    }
                });
            }
        })
    })
    //웹 테스트 용 - form 에서 넘어오기 때문에 req.body.*** 로 받아야함.
    .post(function (req, res) {
        var board_id = req.params.id;
        console.log(board_id);
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] 게시글 읽기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] 검색한 게시글 ID: ' + board._id);
                board.meta.hit += 1; //조회수 +1
                board.save(function (err) { // 변화된 조횟수 저장
                    if (err) throw err;
                    else
                        console.log('POST [성공] 조회수 업데이트. 현재 조회수 : ' + board.meta.hit);
                });
                res.format({
                    json: function () {
                        res.json({board: board});
                    }
                });
            }
        })
    });

//COMMENT
route.route('/comment/:id')
//웹 테스트용
    .get(function (req, res) {
        var board_id = req.params.id;
        var author = req.query.author;
        var body = req.query.body;

        // ID 로 해당 board 찾기
        // mongoose.model('Board').findById(board_id, function (err, board) {
        //     board.update({
        //         $push: {"comment": {author: author, body: body}}
        //     }, function (err, board) {
        mongoose.model('Board').findByIdAndUpdate(board_id,
            {$push: {"comment": {author: author, body: body}}},
            function (err, board) {
                if (err) {
                    res.send("GET [실패] 댓글 달기 실패: " + err);
                } else {
                    console.log('GET [성공] 댓글 달기 성공');
                    res.redirect('http://52.78.207.133:3000/boards/read/' + board_id);
                    //res.redirect('http://localhost:3000/boards/read/' + board_id);
                    //res.json({board : board});
                    console.log('GET [성공] 댓글 달기 후 읽기 화면 요청');
                }
            })
    })
    //안드로이드용
    .post(function (req, res) {
        var board_id = req.params.id;
        var author = req.query.author;
        var body = req.query.body;
        //var author = req.body.author;
        //var body = req.body.body;

        // ID 로 해당 board 찾기
        mongoose.model('Board').findByIdAndUpdate(board_id,
            {$push: {"comment": {author: author, body: body}}},
            function (err, board) {
                if (err) {
                    res.send("POST [실패] 댓글 달기 실패: " + err);
                } else {
                    console.log('POST [성공] 댓글 달기 성공');
                    res.redirect('http://52.78.207.133:3000/boards/read/' + board_id);
                    //res.json({board : board});
                    console.log('POST [성공] 댓글 달기 후 읽기 화면 요청');
                }
            }
        )
    });

//LIKE
//안드로이드용 : POST
route.route('/like/:id')
    .get(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('GET [실패] "좋아요"할 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('GET [성공] "좋아요" 게시글 ID: ' + board._id);
                board.meta.like += 1; //좋아요수 +1
                board.save(function (err) { // 변화된 좋아요 수 저장
                    if (err) throw err;
                    else
                        console.log('GET [성공] 좋아요 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                res.json({response: "ok"});
            }
        })
    })
    //안드로이드용
    .post(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] "좋아요"할 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] "좋아요" 게시글 ID: ' + board._id);
                board.meta.like += 1; //좋아요수 +1
                board.save(function (err) { // 변화된 좋아요수 저장
                    if (err) throw err;
                    else
                        console.log('POST [성공] 좋아요 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                res.json({response: "ok"});
            }
        })
    });

//UNLIKE
//안드로이드용 : POST
route.route('/unlike/:id')
    .get(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('GET [실패] "좋아요 취소"할 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('GET [성공] "좋아요 취소" 게시글 ID: ' + board._id);
                board.meta.like -= 1; //좋아요수 -1
                board.save(function (err) { // 변화된 좋아요 수 저장
                    if (err) throw err;
                    else
                        console.log('GET [성공] 좋아요 취소 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                res.json({response: "ok"});
            }
        })
    })
    //안드로이드용
    .post(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] "좋아요 취소"할 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] "좋아요 취소" 게시글 ID: ' + board._id);
                board.meta.like -= 1; //좋아요수 +1
                board.save(function (err) { // 변화된 좋아요수 저장
                    if (err) throw err;
                    else
                        console.log('POST [성공] 좋아요 취소 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                res.json({response: "ok"});
            }
        })
    });


// UPDATE
route.route('/update/:id')
    .get(function (req, res) {
        //
        // var board_id = req.params.id;
        // mongoose.model('Board').findById(board_id, function (err, board) {
        //     if (err) {
        //         console.log('GET [실패] 해당 게시글 검색 실패 ' + err);
        //     } else {
        //         console.log('GET [성공] 게시글 id : ' + board._id);
        //         res.format({
        //             // html: function () {
        //             //     res.render('boards/update', {
        //             //         title: '글 읽기 화면',
        //             //         "board": board
        //             //     });
        //             // },
        //             json: function () {
        //                 res.json({board: board});
        //             }
        //         });
        //     }
        // });
        var board_id = req.params.id;
        //var newTitle = req.body.title;
        //var newBody = req.body.body;
        var newTitle = req.query.title;
        var newBody = req.query.body;

        mongoose.model('Board').findById(board_id, function (err, board) {
            board.update({
                title: newTitle,
                body: newBody
            }, function (err, board) {
                if (err) {
                    res.send("POST [실패] 글 수정 실패: " + err);
                } else {
                    res.json({response: board_id});
                    console.log('POST [성공] 글 수정 성공');
                }
            })
        })
    })

    .post(function (req, res) {
        var board_id = req.params.id;
        //var newTitle = req.body.title;
        //var newBody = req.body.body;
        var newTitle = req.query.title;
        var newBody = req.query.body;

        mongoose.model('Board').findById(board_id, function (err, board) {
            board.update({
                title: newTitle,
                body: newBody
            }, function (err, board) {
                if (err) {
                    res.send("POST [실패] 글 수정 실패: " + err);
                } else {
                    res.json({response: board_id});
                    console.log('POST [성공] 글 수정 성공');
                }
            })
        })
    });

//DELETE
route.route('/delete/:id')
    .get(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                return console.error(err);
            } else {
                board.remove(function (err, board) {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log('DELETE removing ID: ' + board._id);
                        res.json({message: 'deleted', item: board});
                    }
                })
            }
        })
    })
    .post(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                return console.error(err);
            } else {
                board.remove(function (err, board) {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log('DELETE removing ID: ' + board._id);
                        res.json({message: 'deleted', item: board});
                    }
                })
            }
        })
    });


// mongoose.model('Board').findById(board_id, function (err, board) {
//     board.update({
//         $push: {"comment": {author: author, body: body}},
//     }, function (err, board) {
//         if (err) {
//             res.send("POST [실패] 댓글 달기 실패: " + err);
//         } else {
//             res.json(board);
//             console.log('POST [성공] 댓글 달기 성공');
//         }
//     })
// })

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

module.exports = route;