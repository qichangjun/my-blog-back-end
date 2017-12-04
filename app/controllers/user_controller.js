const db = require('../../db/model.js');
const mongoose = require('mongoose');
const userModel = db.userAPI;
const resObj = require('../../utils/resObj')
const jwt = require('jsonwebtoken')
const secret = 'qichangjun';

exports.getUser = async (info,ctx,next)=>{     
    if (!info.token){
        ctx.status = 200
        ctx.body = resObj(0,'参数不正确')           
        return
    }
    let userObj = {}
    userObj.token = info.token;
    let data = await userModel.find(userObj).exec()    
    if (data.length == 0){        
        ctx.status = 200
        ctx.body = resObj(1004,'用户未找到')                    
        return
    }
    return data[0]
}

exports.registerUser = async (ctx,next)=>{
    let info = ctx.request.body;
    if (!info.userName || !info.password){
        ctx.status = 200;
        ctx.body = resObj(0,'参数不正确')
        return
    }
    let userObj = {}
    userObj.userName = info.userName;
    try{
        let data = await userModel.find(userObj).exec()
        if (data.length !== 0){
            ctx.body = resObj(0,'error','用户名已存在');
        }else{
            info.token = jwt.sign({
                user_id: info.userName,
                }, secret, {
                expiresIn: '12h' //那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
            })
            addUser = new userModel(info)          
            var datas = await addUser.save();
            ctx.status = 200
            ctx.body = resObj(1,'注册成功',null)
        }
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }        
}
 
exports.login = async (ctx,next)=>{
    let info = ctx.request.body
    if (!info.userName || !info.password){
        ctx.status = 200;
        ctx.body = resObj(0,'参数不正确')
        return
    }
    let userObj = {}
    userObj.userName = info.userName
    try{ 
        let data = await userModel.find(userObj).exec()
        if(data.length ==1){
            if(data[0].password == info.password){
                const token = jwt.sign({
                    user_id: data[0]._id,
                    }, secret, {
                    expiresIn: '12h' //过期时间设置为60妙。那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
                });
                userObj.password = info.password
                userModel.findOneAndUpdate(userObj,{token: token}).exec()
                ctx.body = resObj(1,'success',{
                    token : token,
                    userName : data[0].userName,
                    role : (data[0].role || 'normal')
                })
            }else{
                ctx.body = resObj(0,'密码不正确',null)    
            }
        }else{
            ctx.body = resObj(0,'用户不存在',null)
        }              
    }catch(e){
        ctx.body = resObj(0,'error',e)
    }
}

exports.getUserInfo = async (ctx,next)=>{
    let info = ctx.request.query;
    let userObj = {}
    userObj.userName = info.userName;
    try{
        let data = await userModel.find(userObj).exec()
        if (data.length == 0){
            ctx.body = resObj(0,'error','用户不存在');
            return
        }
        let res = {
            userName :  data[0].userName,
            email :  data[0].email,
            role :  data[0].role,
            registerTime :  data[0].registerTime,
            message : data[0].message
        }        
        ctx.body = resObj(1,'回复成功',res);                
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }   
}

