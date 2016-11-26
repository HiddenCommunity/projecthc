//Setup Mongoose to MongoDB
var mongoose = require('mongoose');
if (process.platform == "win32") {
    console.log('this platform is ${process.platform}');
    var fs = require('fs');
    var tunnel = require('tunnel-ssh');

    var key = fs.readFileSync('../projecthc/hc_server.pem');
    var config = {
        port: 22,
        username: 'centos',
        host: '52.78.207.133',
        dstPort:'27017',
        privateKey:key
    };

    var hc_db = tunnel(config,function(error,hc_db){
        if(error){
            console.log("SSH connection error: " + error);
        }
        console.log('ssh connection initalizing');
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost:27017/hcDB');
        console.log('data base connect complete');
    });
} else {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost:27017/hcDB');
}

