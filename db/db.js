const db = require('mongoose');
var config = require('../config');
db.Promise = global.Promise;
/**
* 连接
*/
db.connect(config.mongodb_url);

/**
* 连接成功
*/
db.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + config.mongodb_url);  
});    

/**
* 连接异常
*/
db.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    

/**
* 连接断开
*/
db.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
});    

module.exports = db;