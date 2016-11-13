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

//http://52.78.207.133:3000/boards/
router.route('/')
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
router.get('/new', function(req, res) {
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
router.route('/:id')
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
router.route('/:id/edit')
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
            }, function (err, blobID) {
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

module.exports = router;