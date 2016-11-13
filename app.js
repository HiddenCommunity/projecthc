var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(), //express application
    db = require('./model/db'),  //db 파일을 변수로 추가한다.
    members = require('./model/member'),
    boards = require('./model/board'),
    routes = require('./routes/index');
//    members = require('./routes/members');

// view engine setup
app.set('views', path.join(__dirname, 'views'));  //view 템플릿이 있는 디렉토리
app.set('view engine', 'jade');  //사용할 템플릿 엔진

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware 함수 호출
app.use('/', routes);
app.use('/members', members);
app.use('/boards', boards);

// catch 404 and forward to error handler
// 마운트 경로가 없는 미들웨어함수. 앱이 요청을 받을 때마다 실행된다.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// 에러 발생시, stacktrace 출력해준다.
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
