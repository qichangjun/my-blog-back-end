const db = require('../../db/model.js');
const mongoose = require('mongoose');
const userModel = db.userAPI;
const articleModel = db.articleAPI;
const labelModel = db.labelAPI;

const resObj = require('../../utils/resObj')
const userController = require('./user_controller')

exports.getLabelLists = async (ctx,next)=>{
    let info = ctx.request.body;    
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
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
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
 
exports.addLabel = async (ctx,next)=>{
    let info = ctx.request.body;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        info.label = Array.isArray(info.label) ? info.label : [info.label]
        for (let i = 0;i < info.label.length;i++){
            let res = await labelModel.find({name : info.label[i]});
            if(res.length > 0){                 
                res[0].number++;                
                let addData = new labelModel(res[0])
                await addData.save();              
            }else{
                let addInfo = {name : info.label[i]}
                addArticle = new labelModel(addInfo)          
                await addArticle.save();
            }            
        }        
        ctx.body = resObj(1,'操作成功',res);  
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}