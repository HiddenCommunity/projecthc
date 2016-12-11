var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose');

//내 대화 전체 목록
route.route('/myList/:member')
    .get(function (req, res) {
        var member = req.params.member;
        var members = [];

        mongoose.model('Message').distinct("sender", {"recipient": member}).exec(function (err, senders) {
            if (err) {
                return console.error(err);
            } else {
                mongoose.model('Message').distinct("recipient", {"sender": member}).exec(function (err, recipients) {
                    if (err) {
                        return console.error(err);
                    } else {
                        for (var i = 0; i < senders.length; i++)
                        {
                            members.push(senders[i]);
                            console.log(members[i]);
                        }
                        for (var i = 0; i < recipients.length; i++)
                        {
                            if (members.indexOf(recipients[i]) == -1)
                                members.push(recipients[i]);
                        }

                        res.json({members: members});
                    }
                })
            }
        })
    })

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
                res.redirect('http://52.78.207.133:3000/messages/room/'+ recipient);
                //res.redirect('http://localhost:3000/messages/room/'+ recipient +'/sender/'+sender);
                console.log('GET [성공] 메시지 전송 성공 ' + msg._id);
            }
        });
    });

//해당 사람과의 대화내용 리스트
route.route('/room/:recipient/:sender')
    .get(function (req, res) {
        var recipient = req.params.recipient;
        var sender = req.params.sender;

        //받는 사람이 나이거나, 보낸 사람이 나인 메시지들
        mongoose.model('Message').find().or([
            {$and: [{recipient: {$regex: recipient}},{sender: {$regex: sender}}]},
            {$and: [{recipient: {$regex: sender}},{sender: {$regex: recipient}}]}
        ]).sort({date: 1}).exec(function (err, msgs) {
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