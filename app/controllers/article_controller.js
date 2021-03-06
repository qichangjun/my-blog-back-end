const db = require('../../db/model.js');
const mongoose = require('mongoose');
const userModel = db.userAPI;
const articleModel = db.articleAPI;
const labelModel = db.labelAPI;

const resObj = require('../../utils/resObj')
const userController = require('./user_controller')

exports.createArticle = async (ctx,next)=>{
    let info = ctx.request.body;
    try {
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        if (info.label && info.label.length > 5) {
            ctx.body = resObj(0,'error','标签不能超过5个');
            return 
        }  
        info.author = user.userName
        info.lastReplyTime = new Date();                    
        addArticle = new articleModel(info)          
        await addArticle.save();
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
        ctx.status = 200
        ctx.body = resObj(1,'创建成功',null)
    }catch(err){
        ctx.body = resObj(0,'err',err.toString());
    }         
}
 
exports.editArticle = async (ctx,next)=>{
    let info = ctx.request.body;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return
        }
        let art = await articleModel.findById(info._id)
        if (art.author != user.userName){
            ctx.body = resObj(0,'用户无权限')
            return
        }
        art.content = info.content
        art.title = info.title
        art.label = info.label
        addArticle = new articleModel(art)          
        await addArticle.save();
        ctx.status = 200
        ctx.body = resObj(1,'编辑成功',null)            
    }catch(err){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }    
}

exports.getArticleLists = async (ctx,next)=>{
    let info = ctx.request.body;    
    try {
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let res = {}
        let count = parseInt (info.pageSize?info.pageSize : 50)
        let skipNum = 0
        if (info.currentPage && info.pageSize){                
            skipNum = (info.currentPage-1)*info.pageSize
        }                                             
        let sort = {}
        if (info.sortField){
            sort[info.sortField] = info.sortWay || -1            
        }else{
            sort.lastReplyTime = -1            
        }    
        labels = {}
        if (info.labels && info.labels.length > 0){
            labels = {label :{"$all":info.labels} }
        }
        let length = await articleModel.find(labels).count();  
        res.data = await articleModel.find(labels).limit(count).skip(skipNum).sort(sort).exec();
        res.totalElement = length
        ctx.status = 200
        ctx.body = resObj(1,'操作成功',res)
    }catch(err){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }  
}

exports.deleteArticle = async (ctx,next)=>{
    let info = ctx.request.body;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        if (user.role == 'admin'){
            var getParams = {
                _id : info.id                  
            } 
        }else{
            var getParams = {
                _id : info.id,
                author : user.userName
            }
        }   
        let res = await articleModel.findOneAndRemove(getParams).exec()
        if (res){
            ctx.status = 200
            ctx.body = resObj(1,'操作成功',res)
        }else{
            ctx.body = resObj(2,'没有权限或文章已经被删除',null)
        }
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString())
    }   
}

exports.getOwnarticleLists = async (ctx,next)=>{
    let info = ctx.request.body;
    let userObj = {
        userName : info.userName
    }
    try{
        let data = await userModel.find(userObj).exec()
        if (data.length == 0){
            ctx.body = resObj(0,'error','用户不存在');
        }else{ 
            let params = {}
            params.author = data[0].userName    
            let res = await articleModel.find(params);
            ctx.status = 200
            ctx.body = resObj(1,'操作成功',res)
        }              
    }catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }   
}

exports.updateCheckTimes = async (ctx,next)=>{
    let info = ctx.request.body;
    try {
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let res = await articleModel.findById(info.id);
        if(res){                    
            res.viewed++;                
            let addData = new articleModel(res)
            await addData.save();
            ctx.body = resObj(1,'操作成功',res);    
        }else{
            ctx.body = resObj(0,'文章不存在',res)
        }   
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString())
    }
}

exports.getArticleDetail = async (ctx,next)=>{
    let getParams = ctx.request.query;
    let id = getParams.id
    try{
        let data = await articleModel.findById(id);
        if (data){
            ctx.status = 200
            ctx.body = resObj(1,'操作成功',data)
        }
    } catch(e){
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}

exports.addReply = async(ctx,next)=>{
    let info = ctx.request.body;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let userName = user[0].userName
        let res = await articleModel.findById(info.id);
        if(!res){
            ctx.body = resObj(0,'文章不存在',res)
            return
        }
        res.lastReplyTime = new Date()
        res.replyList.push({
            userName : userName,
            content : info.content
        })
        res.replyNum = res.replyList.length        
        let addData = new articleModel(res)
        await addData.save();
        if (res.author != userName){
            author = await userModel.find({userName:res.author}).exec();
            author = author[0]
            author.message = author.message || []
            author.message.push({type:'reply',content:`${userName} 回复了你的帖子 ${res.title}`,topciId:info.id,fromUser:userName})
            addData = new userModel(author)
            await addData.save();
        }
        ctx.body = resObj(1,'回复成功',res);    
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString())
    } 
}

exports.addChildReply = async (ctx,next)=>{
    let info = ctx.request.body;
    try {
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let userName = user.userName
        let res = await articleModel.findById(info.artId);
        if(!res){
            ctx.body = resObj(0,'文章不存在',res)
            return
        }
        res.replyList.forEach((reply) =>{
          if (reply._id == info.id){
            reply.replyChildList.push({
                userName:user.userName,
                content:info.content
            })            
          }  
        })
        res.lastReplyTime = new Date()
        let addData = new articleModel(res)
        await addData.save();
        ctx.body = resObj(1,'回复成功',res);    
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString())
    }
}

exports.deleteReply = async (ctx,next) =>{
    let info = ctx.request.body;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let userName = user.userName
        let res = await articleModel.findById(info.artId);
        if(!res){
            ctx.body = resObj(0,'文章不存在',res)
            return
        }
        for (let i=0;i<res.replyList.length;i++){
            if (res.replyList[i]._id == info.id && res.replyList[i].userName == user.userName){
                res.replyList.splice(i,1)
                res.replyNum = res.replyList.length
                break;
            } 
        }
        let addData = new articleModel(res)
        await addData.save();
        ctx.body = resObj(1,'删除成功',res); 
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString()) 
    }
}

exports.deleteMessage = async (ctx,next) =>{
    let info = ctx.request.query;
    try{
        let user = await userController.getUser(info,ctx,next)
        if (!user){
            return 
        }
        let i = 0
        while (i < data[0].message.length) {
            if (data[0].message[i]._id == info.id){
                data[0].message.splice(i,1)
                break;
            }        
            i++;  
        }             
        let addData = new userModel(data[0])        
        let res = await addData.save();
        ctx.body = resObj(1,'删除成功',res.message); 
    }catch(err){
        ctx.body = resObj(0,'数据库错误',err.toString())
    }
}