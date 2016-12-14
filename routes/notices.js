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
    .post(function (req, res) {
        var board_id = req.params.boardId;
        console.log(board_id);

        mongoose.model('Notice').update({boardId: board_id}, {
            check: true
        }, function (err, notice) {
            if (err) {
                console.log('POST [실패] Notice 체크 실패 에러 : ' + err);
            } else {
                res.json({response: "ok"});
                console.log('POST [성공] Notice Check 성공');
            }
        })
    })


module.exports = route;