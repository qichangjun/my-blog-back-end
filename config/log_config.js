var path = require('path');

var errorLogPath = path.resolve(__dirname,"../logs/error/error");

var responseLogPath = path.resolve(__dirname,"../logs/response/response");

module.exports = {
    "appenders":
    {
        errorLogger:{
            "type": "dateFile",                   //日志类型
            "filename": errorLogPath,             //日志输出位置
            "alwaysIncludePattern":true,          //是否总是有后缀名
            "pattern": "-yyyy-MM-dd-hh.log"       //后缀，每小时创建一个新的日志文件
        },
        resLogger:{
            "type": "dateFile",
            "filename": responseLogPath,
            "alwaysIncludePattern":true,
            "pattern": "-yyyy-MM-dd-hh.log"
        }
    },       
    categories: { 
        default: { 
            appenders: ['resLogger','errorLogger'], 
            level: 'ALL' 
        }
    }
}