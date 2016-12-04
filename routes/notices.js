var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose');


//알림읽으면 CHECK : TRUE로 바꿔야함.
//CHECK : FALSE인것만 화면에 보여줌.

route.route('/list/:boardAuthor')
    .get(function (req, res) {
        var boardAuthor = req.params.boardAuthor;

        mongoose.model('Notice').find({boardAuthor : boardAuthor}).sort({date:-1}).exec(function (err, notices) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    //웹테스트용
                    // html: function () {
                    //     res.render('boards/index', {title: major, "boards": boards});
                    // },
                    json: function () {
                        res.json({notices: notices});
                    }
                });
            }
        })
    })
