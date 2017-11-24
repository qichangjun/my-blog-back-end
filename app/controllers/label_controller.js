const db = require('../../db/model.js');
const mongoose = require('mongoose');
const userModel = db.userAPI;
const articleModel = db.articleAPI;
const labelModel = db.labelAPI;

const resObj = require('../../utils/resObj')

exports.getLabelLists = async (ctx,next)=>{
    let info = ctx.request.body;    
    if (!info.token){
        ctx.status = 200;
        ctx.body = resObj(0,'参数不正确')
        return
    }
    let userObj = {}
    userObj.token = info.token;
    try{        
        let data = await userModel.find(userObj).exec()        
        if (data.length == 0){
            ctx.body = resObj(0,'error','用户不存在');
        }else{         
            let sort = {}
            sort['number'] =  -1        
            count = 10               
            const reg = new RegExp(info.keyword,'i')                
            let data = await labelModel.find({
                $or : [
                    {name : {$regex : reg}}
                ]
            }).limit(count).sort(sort).exec();
            ctx.status = 200
            ctx.body = resObj(1,'操作成功',data)
        }     
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }        
}
 
exports.addLabel = async (ctx,next)=>{
    let info = ctx.request.body;
    if (!info.token){
        ctx.status = 200;
        ctx.body = resObj(0,'参数不正确')
        return
    }
    let userObj = {}
    userObj.token = info.token;
    try{
        let data = await userModel.find(userObj).exec()        
        if (data.length == 0){
            ctx.body = resObj(0,'error','用户不存在');
        }else{                 
            let res = await labelModel.find({name : info.label});
            if(res.length > 0){                 
                res.number++;                
                let addData = new labelModel(res)
                await addData.save();
                ctx.body = resObj(1,'操作成功',res);   
                return  
            }
            let addInfo = {name : info.label}
            addArticle = new labelModel(addInfo)          
            await addArticle.save();
            ctx.body = resObj(1,'操作成功',res);   
        }     
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }     
}