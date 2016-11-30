var express = require('express'),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

var db = require('./model/db'),  //db 파일을 변수로 추가한다.
    member = require('./model/member'),
    board = require('./model/board'),
    message = require('./model/message');

var routes = require('./routes/index'),
    members = require('./routes/members'),
    boards = require('./routes/boards'),
    emails = require('./routes/emails'),
    messages = require('./routes/messages');

// view engine setup
app.set('views', path.join(__dirname, 'views'));  //view 템플릿이 있는 디렉토리
app.set('view engine', 'jade');  //사용할 템플릿 엔진

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));


//middleware. route 등록
app.use('/', routes);
app.use('/members', members);  // '/members' 경로로 들어오는 모든 접속은 router에게 위임한다.
app.use('/boards', boards);
app.use('/emails', emails);
app.use('/messages', messages);

// catch 404 and forward to error handler
// 마운트 경로가 없는 미들웨어함수. 앱이 요청을 받을 때마다 실행된다.
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// 에러 발생시, stacktrace 출력해준다.
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.get('/favicon.ico', function (req, res) {
    res.send(200);
});

module.exports = app;
