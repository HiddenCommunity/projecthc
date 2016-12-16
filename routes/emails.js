var express = require('express'),
    route = express.Router(),
    mongoose = require('mongoose'),
    nodeMailer = require('nodemailer'),
    mcrypt = require('js-rijndael');  //이메일 암호화


//메일보내기 "테스트용/실제용 코드다르니까 확인할것!"
route.post('/send/:email',function(req, res){
    var email = req.params.email;
    console.log(email);
    // create reusable transporter object using the default SMTP transport
    var transporter = nodeMailer.createTransport({ service: 'Gmail', auth: { user: 'carsilverstar@gmail.com', pass: 'a298870a' } });
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"HiddenCommunity" <hc@hiddencommunity.com>', // sender address
        to: email, // list of receivers
        subject: 'Hidden Community 가입 인증메일 ', // Subject line
        html:'<p><img src="http://i.imgur.com/xhasOE5.png"/></p><h1>HiddenCommunity 가입 인증 메일입니다.</h1><h4>안녕하세요.</h4><h4>Hidden Community 서비스에 가입해주셔서 감사합니다.</h4><h4>아래 링크를 클릭하여 Hidden Community 서비스의 가입 인증을 완료해주세요.</h4><p><a href="http://52.78.207.133:3000/emails/confirm/'+ email+'"><img src="http://i.imgur.com/k698ooP.png" width="200", height="66"/></a></p></p>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            res.json(error);
            return console.log(error);
        }
        console.log('메일을 보냈습니다.' + info.response);
        res.json({response : "ok"});
    });
});

//인증메일에서 버튼클릭하면 이쪽으로 온다.
route.get('/confirm/:email', function(req,res) {
    var hmac = crypto.createHmac('sha1', 'hiddenCommunity');
    hmac.setEncoding('hex');
    hmac.write(req.query.email);
    hmac.end();
    var email = hmac.read();

    console.log(email);
    //--------------------------------------암호화하기추가해야함!
    //디비에 인증된 이메일 등록
    mongoose.model('Member').create({
        email: email
    }, function (err, member) {
        if (err) {
            res.send("[실패] 이메일 insert 실패");
        } else {
            //member 생성 성공
            console.log('POST 새 멤버 추가 성공 : ' + member);
            //등록 되었으면 인증 화면을 띄워준다.
            res.end('<h1>HiddenCommunity 인증완료</h1><p><img src="http://i.imgur.com/xhasOE5.png"/></p>');
        }
    })
});

//이메일 인증 완료 후, 안드로이드에서 '인증완료'버튼을 눌렀을 때. db 에서 인증한 이메일이 있는지 체크
//테스트 : get
route.post('/validate/:email', function(req,res) {
    var hmac = crypto.createHmac('sha1', 'hiddenCommunity');
    hmac.setEncoding('hex');
    hmac.write(req.query.email);
    hmac.end();
    var email = hmac.read();
    console.log(email);
    //DB에 해당 이메일이 들어있나 체크.
    mongoose.model('Member').findOne({'email': email }, function (err, member) {
        if (err) {  //에러처리해야함.안하면 에러
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.json({message: err.status + ' ' + err});
        } else {
            if (member == null) {  //db에 그 email 이 없으면 404
                res.json({response: "failed"});
                console.log('db에 해당하는 email이 없음');
                return;
            }
            console.log(member);
            res.json({response: "ok"});
        }
    });
});

module.exports = route;