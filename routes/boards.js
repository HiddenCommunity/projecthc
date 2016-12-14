var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose');

//CREATE
//테스트용 : POST form에서 넘어오기 때문에 req.body.*** 로 받아야함.
//안드로이드 : POST req.query.*** 로 받고 -> DB에 넣고 -> 새 Board를 생성 -> 성공하면 작성한 board_id를 string으로 만들어서 리턴
route.route('/new')
    .get(function (req, res) {
        res.render('boards/new');
    })
    .post(function (req, res) {
        //웹테스트용
        //  var category = req.body.major;
        //  var author = req.body.author;
        //  var title = req.body.title;
        //  var body = req.body.body;
        //  var tagArr = req.body.tag.split(' ');

        //안드로이드용
        var category = req.query.category;
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

//LIST - 최신순
//테스트용 : 전공게시판 리스트 GET 요청
//안드로이드에서 해당 전공게시판 리스트 GET 요청
route.route('/list/:major/:value')
    .get(function (req, res) {
        var major = req.params.major;
        var value = req.params.value;

        //정렬기준설정
        if(value==0){
            value = "date";
        }else if(value==1){
            value = "meta.hit";
        }else{
            value = "meta.like";
        }

        var query = {};
        query[value] = -1;
        mongoose.model('Board').find({category: major}).sort(query).exec(function (err, boards) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    //웹테스트용
                    // html: function () {
                    //     res.render('boards/index', {title: major, "boards": boards});
                    // },
                    json: function () {
                        res.json({boards: boards});
                    }
                });
                console.log(value + '기준으로 정렬된 리스트');
            }
        })
    })

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
                        console.log(board);
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
//웹테스트용 POST
// 안드로이드 GET
route.route('/comment/:id')
    //안드로이드
    .get(function (req, res) {
        var board_id = req.params.id;
        var author = req.query.author;
        var body = req.query.body;

        mongoose.model('Board').findByIdAndUpdate(board_id,
            {$push: {"comment": {author: author, body: body}}},
            function (err, board) {
                if (err) {
                    res.send("GET [실패] Comment 실패: " + err);
                } else {
                    console.log('GET [성공] Comment 성공');
                    //알림목록에 추가한다.
                    mongoose.model('Notice').create({
                        boardId : board_id,
                        boardAuthor: board.author,
                        actionAuthor : author,
                        type : "comment"
                    }, function (err, notice) {
                        if (err) {
                            console.log('[error] Notice 실패');
                        } else { //알림 목록 추가 성공
                            console.log('GET [성공] Notice 성공 ' + notice._id);
                            res.redirect('http://52.78.207.133:3000/boards/read/' + board_id);
                        }
                    });
                    console.log('GET [성공] 댓글 달기 후 읽기 화면 요청');
                }
            }
        )
    })
    //웹테스트용
    .post(function (req, res) {
        var board_id = req.params.id;
        var author = req.body.author;
        var body = req.body.body;

        mongoose.model('Board').findByIdAndUpdate(board_id,
            {$push: {"comment": {author: author, body: body}}},
            function (err, board) {
                if (err) {
                    res.send("POST [실패] Comment 실패: " + err);
                } else {
                    console.log('POST [성공] Comment 성공');
                    //알림목록에 추가한다.
                    mongoose.model('Notice').create({
                        boardId : board_id,
                        boardAuthor: board.author,
                        actionAuthor : author,
                        type : "comment"
                    }, function (err, notice) {
                        if (err) {
                            console.log('[error] Notice 생성 실패');
                        } else { //알림 목록 추가 성공
                            console.log('POST [성공] Notice 작성 성공 ' + notice._id);
                            res.redirect('http://localhost:3000/boards/read/' + board_id);
                        }
                    });
                    console.log('POST [성공] 댓글 달기 후 읽기 화면 요청');
                }
            }
        )
    });

//LIKE
route.route('/like/:id')
    .post(function (req, res) {
        var board_id = req.params.id;
        var author = req.query.author;

        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] LIKE 할 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] LIKE 게시글 ID: ' + board._id);
                board.meta.like += 1; //좋아요수 +1
                board.save(function (err) { // 변화된 좋아요 수 저장
                    if (err) throw err;
                    else
                        console.log('POST [성공] LIKE 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                //알림목록에 추가한다.
                mongoose.model('Notice').create({
                    boardId : board_id,
                    boardAuthor: board.author,
                    actionAuthor : author,
                    type : "like"
                }, function (err, notice) {
                    if (err) {
                        console.log('[error] Notice 실패');
                    } else { //알림 목록 추가 성공
                        console.log('POST [성공] Notice 성공 ' + notice._id);
                    }
                });
                //res.json({board : board});
                res.json({response: "ok"});
            }
        })
    });

//UNLIKE
route.route('/unlike/:id')
    .post(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] "UNLIKE" 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] "UNLINE" 게시글 ID: ' + board._id);
                board.meta.like -= 1; //좋아요수 +1
                board.save(function (err) { // 변화된 좋아요수 저장
                    if (err) throw err;
                    else
                        console.log('POST [성공] UNLIKE 업데이트. 현재 좋아요수 : ' + board.meta.like);
                });
                res.json({response: "ok"});
            }
        })
    });

//신고 hate
route.route('/hate/:id')
    .post(function (req, res) {
        var board_id = req.params.id;
        mongoose.model('Board').findById(board_id, function (err, board) {
            if (err) {
                console.log('POST [실패] "신고" 게시글 찾기 실패 에러 : ' + err);
            } else {
                console.log('POST [성공] "신고"한 게시글 ID: ' + board._id);
                board.meta.hate += 1; //신고수 +1
                board.save(function (err) { // 변화된 신고수 저장
                    if (err) throw err;
                    else {
                        if(board.meta.hate==5)
                            res.redirect('http://52.78.207.133:3000/boards/delete/' + board_id);
                        else {
                            res.json({response: "ok"});
                            console.log('POST [성공] HATE 업데이트. 현재 신고수 : ' + board.meta.hate);
                        }
                    }
                });
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
        var newTagArr = req.query.tag.split(' ');

        mongoose.model('Board').findById(board_id, function (err, board) {
            board.update({
                title: newTitle,
                body: newBody,
                tag:newTagArr
            }, function (err, board) {
                if (err) {
                    res.send("GET [실패] Update 실패: " + err);
                } else {
                    res.json({response: board_id});
                    console.log('GET [성공] Update 성공');
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
        var newTagArr = req.query.tag.split(' ');

        mongoose.model('Board').findById(board_id, function (err, board) {
            board.update({
                title: newTitle,
                body: newBody,
                tag:newTagArr
            }, function (err, board) {
                if (err) {
                    res.send("POST [실패] Update 실패: " + err);
                } else {
                    res.json({response: board_id});
                    console.log('POST [성공] Update 성공');
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
                        console.log('GET [성공] DELETE 성공! 삭제한 게시글ID: ' + board._id);
                        res.json({response:"ok"});
                    }
                })
            }
        })
    })
    //안드로이드용
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
                        console.log('POST [성공] DELETE 성공! 삭제한 게시글ID: ' + board._id);
                        res.json({response:"ok"});
                    }
                })
            }
        })
    });

//SEARCH
//글내용, 태그, 작성자 검색
route.route('/search/:keyword')
    .get(function (req, res) {
        // 웹테스트용
        // res.render('boards/search');
        var keyword = req.params.keyword;

        mongoose.model('Board').find().or([
            {title: {$regex:keyword}},
            {body: {$regex:keyword}},
            {tag: {$regex:keyword}},
            {author: {$regex:keyword}}
        ]).sort({date: -1}).exec(function (err, boards) {
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
    })
    //웹테스트용
    .post(function (req, res) {
        var keyword = req.body.keyword;

        mongoose.model('Board').find().or([
            {title: {$regex:keyword}},
            {body: {$regex:keyword}},
            {tag: {$regex:keyword}},
            {author: {$regex:keyword}}
        ]).sort({date: -1}).exec(function (err, boards) {
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

module.exports = route;