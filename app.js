var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dbApi = require('./jsonDB/dbApi')
const knexQuery = require('./database/knexQuery')
dbApi.init()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let getCharacterData = require('./routes/getCharacterData');
let getProgressData = require('./routes/getProgressData');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// user make
// 검증 미들웨어  api 를 요청할때 필요한 애들이 여기 다 있는지 확인 미들웨어
let requestBodyCheck = require('./middlewares/requestBodyCheck')
app.use(requestBodyCheck)


// router
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/getCharacterData',getCharacterData)
app.use('/getProgressData',getProgressData)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// 블리자드 api 캐릭터의 정보를 가져오는 툴
// 정보를 가져오는걸 클라이언트에서 하고 그다음에 ui 로 그려줌
// 정보를 가져오는 것만 만드는 중 <--!
//