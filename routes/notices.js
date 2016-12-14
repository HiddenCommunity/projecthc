var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose');


//알림읽으면 CHECK : TRUE로 바꿔야함.
//CHECK : FALSE인것만 화면에 보여줌.

route.route('/list/:me')
    .get(function (req, res) {
        var boardAuthor = req.params.me;

        mongoose.model('Notice').find({boardAuthor : boardAuthor}).sort({date:-1}).exec(function (err, notices) {
            if (err) {
                return console.error(err);
            } else {
                res.json({notices: notices});
            }
        });
    })

route.route('/check/:boardId')
    //안드로이드용
    .get(function (req, res) {
        var board_id = req.params.id;
        console.log(board_id);
        mongoose.model('Notice').find({boardId:board_id}).exec(function (err, notice) {
            if (err) {
                console.log('GET [실패] Notice 체크 실패 에러 : ' + err);
            } else {
                console.log('GET [성공] Notice 체크 완료 게시글 ID: ' + notice.boardId);
                notice.check == true; //체크했다고 표시
                notice.save(function (err) { // 체크여부 저장
                    if (err) throw err;
                    else
                        console.log('GET [성공] 체크완료 : ' + notice.check);
                });
                res.format({
                    json: function () {
                        res.json({response: "ok"});
                    }
                });
            }
        })
    })