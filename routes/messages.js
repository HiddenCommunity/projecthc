var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose'),
    socket = require('socket.io');

route.route('/send')
    .get(function (req, res) {
        res.render('messages/send', {title: '메시지 전송'});
    })
    .post(function (req, res) {
        var recipient = req.body.recipient;
        var sender = req.body.sender;
        var body = req.body.body;

        mongoose.model('Message').create({
            recipient: recipient,
            sender: sender,
            body: body
        }, function (err, msg) {
            if (err) {
                res.send("[error] 메시지 전송 실패");
                console.log('POST [실패] 메시지 전송 실패');
            } else { //게시글 생성 성공
                console.log('POST [성공] 메시지 전송 성공 ' + msg._id);
                var id = msg._id.toString();
                res.json(
                    {response: id});
            }
        });

    })


module.exports = route;