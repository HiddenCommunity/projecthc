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
//전공1게시판
route.get('/:major', function(req, res){
    var major1 = req.params.major1;
    mongoose.model('Board').find({category: major}, function (err, boards) {
        if (err) {
            return console.error(err);
        } else {
            res.json(boards);
        }
    });
});

//POST 새 게시글 작성
route.post('/:major/new', function(req, res) {
        var category = req.params.major;
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
            comments : []  //처음생성될 때는 댓글이없음.
        }, function (err, board) {
            if (err) {
                res.send("[error] 게시글 작성 실패");
            } else { //게시글 생성 성공
                console.log('POST 게시글 작성 ' + board.title);
                res.json(board);
            }
        });
    });

// req.param 중에 id가 있을 때,에러 체킹 :id 를 가지고 db에 들어있는지 확인.
route.param('id', function(req, res, next, id) {
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

// /boards/582674abcdf9fa75d82270d9
route.route('/:id')
    .get(function(req, res) {
        var id = req.id;
        mongoose.model('Board').findById(req.id, function (err, board) {
            if (err) {
                console.log('GET [에러]: 검색 실패! ' + err);
            } else {
                console.log('GET [성공] 검색한 ID: ' + board._id);
                res.res.json(board);
            }
        });
    });

//http://52.78.207.133:3000/boards/582674abcdf9fa75d82270d9/edit
route.route('/:id/edit')
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
                res.json(board);
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


module.exports = route;