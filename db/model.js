const mongodb = require('./db.js');
const Schema = mongodb.Schema;

/**
 * 用户模型
 */
let adminUser = {
    userName:{unique:true,type:String},
    password:String,
    token:String,
    registerTime:{type:Date,default:Date.now},
    email:String,
    role: String
};
let userSchema = new Schema(adminUser);
let userModel = mongodb.model("usersModel", userSchema);

/**
 * 文章模型
 */
let article = {
    title:{required: true,type:String},
    content:String,
    creatDate:{type:Date,default:Date.now},
    author:String,
    viewed : {type:Number,default:0},
    replyNum : { type: Number, default:0 },
    lastReplyTime : {type : Date},
    label : [],
    replyList :[
        {
            userName:String,
            replyTime:{ type: Date, default: Date.now },
            content:String,
            replyChildList:[
                {
                    userName:String,
                    replyTime:{ type: Date, default: Date.now },
                    content:String
                }
            ]
        }
    ]
}
let articleSchema = new Schema(article);
let articleModel = mongodb.model("articleModel",articleSchema);

/**
 * 标签模型
 */
let label = {
    name : {unique:true,type:String},
    number : {type:Number,default:1},
}
let labelSchema = new Schema(label)
let labelModel = mongodb.model('labelModel',labelSchema)


exports.userAPI = userModel;
exports.articleAPI = articleModel;
exports.labelAPI = labelModel