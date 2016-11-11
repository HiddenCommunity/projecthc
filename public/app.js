//Load packages
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),  // POST 데이터 처리
    mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost:27017/hcDB');

//Define model
var Member = require('./models/membler');


var port = process.env.PORT || 3000;

var router = require('./routes')(app, Member);

var server = app.listen(port, function(){
    console.log("Express server has started on port " + port);
});