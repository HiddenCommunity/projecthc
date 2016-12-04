var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose');

//메시지 전송
route.route('/send/:recipient')
    // .get(function (req, res) {
    //     res.render('messages/send', {title: '메시지 전송'});
    // })
    .get(function (req, res) {
        // 웹테스트용
        // var recipient = req.body.recipient;
        // var sender = req.body.sender;
        // var body = req.body.body;

        //안드로이드용
        var recipient = req.params.recipient;
        var sender = req.query.sender;
        var body = req.query.body;

        mongoose.model('Message').create({
            recipient: recipient,
            sender: sender,
            body: body
        }, function (err, msg) {
            if (err) {
                res.send("[error] 메시지 전송 실패");
                console.log('GET [실패] 메시지 전송 실패');
            } else { //메시지 전송 성공
                //res.json({message : msg.body});
                res.redirect('http://52.78.207.133:3000/messages/list/'+ recipient);
                console.log('GET [성공] 메시지 전송 성공 ' + msg._id);
            }
        });
    });

//LIST
route.route('/list/:recipient')
    .get(function (req, res) {
        var recipient = req.params.recipient;

        mongoose.model('Message').find().or([
            {recipient: {$regex:recipient}},
            {sender: {$regex:recipient}}
        ]).sort({date: -1}).exec(function (err, msgs) {
            //db에서 날짜 순으로 데이터들을 가져옴
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    // html: function () {
                    //     res.render('messages/index', {title: recipient+'의 메시지 목록', "messages": msgs});
                    // },
                    json: function () {
                        res.json({msgs: msgs});
                    }
                });
            }
        })
    })


module.exports = route;