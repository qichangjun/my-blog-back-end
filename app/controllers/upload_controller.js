const resObj = require('../../utils/resObj')
const path = require('path')
const os = require('os')
const fs = require('fs')
const Busboy = require('busboy')
const qiniu = require('qiniu')

/**
 * 异步创建文件夹
 * @param {文件夹名称} dirname 
 */
const mkdirsSync = (dirname) => {
    if (fs.existsSync(dirname)) {
     return true
    } else {
     if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
     }
    }
    return false
}

/**
 * 获取文件格式
 * @param {文件全名} fileName 
 */
function getSuffix (fileName) {
    return fileName.split('.').pop()
}

/**
 * 重命名文件
 * @param {文件全名} fileName 
 */
function Rename (fileName) {
    return Math.random().toString(16).substr(2) + '.' + getSuffix(fileName)
}

/**
 * 删除服务器上的缓存文件
 * @param {要删除的文件路径} path 
 */
function removeTemImage (path) {
    fs.unlink(path, (err) => {
     if (err) {
      throw err
     }
    })
}

/**
 * 上传文件到本地服务器
 * @param {*} ctx 
 * @param {上传的配置对象} options 
 */
function uploadFile (ctx, options) {
    const _emmiter = new Busboy({headers: ctx.req.headers})
    const fileType = options.fileType
    const filePath = path.join(options.path, fileType)
    const confirm = mkdirsSync(filePath)
    if (!confirm) {
     return
    }
    console.log('start uploading...')
    return new Promise((resolve, reject) => {
     _emmiter.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const fileName = Rename(filename)
      const saveTo = path.join(path.join(filePath, fileName))
      file.pipe(fs.createWriteStream(saveTo))
      file.on('end', function () {
       resolve({
        imgPath: `/${fileType}/${fileName}`,
        imgKey: fileName
       })
      })
     })
    
     _emmiter.on('finish', function () {
      console.log('finished...')
     })
    
     _emmiter.on('error', function (err) {
      console.log('err...')
      reject(err)
     })
    
     ctx.req.pipe(_emmiter)
    })
}

/**
 * 将本地服务器的图片保存到七牛
 * @param {*本地图片路径} filePath 
 * @param {*修改后的图片名} key 
 */
function upToQiniu (filePath, key) {
    const accessKey = 'MOaWgDh4CQzs84LprkRrdsjSWaSjs4cQq75j6my2'// 你的七牛的accessKey
    const secretKey = 'Oyha3VatmV48yLicQpOt_HjZ-FLXz9Fgcvx5jtlp' // 你的七牛的secretKey
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    
    const options = {
     scope: 'xiaoqi-angularjs' // 你的七牛存储对象
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
    
    const config = new qiniu.conf.Config()
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z0;
    const localFile = filePath
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    // 文件上传
    return new Promise((resolved, reject) => {
     formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
       reject(respErr)
      }
      console.log(respBody,respInfo)
      if (respInfo.statusCode == 200) {
       resolved(respBody)
      } else {
       resolved(respBody)
      }
     })
    })
    
   }

function readMdFile (ctx,path){
    return new Promise((resolved, reject) => {
        fs.readFile(path,"utf-8",function(err,data){
            // removeTemImage(imgPath)
            if (err){
                reject(err)
            }       
            resolved(data)
        });
    })    
}

/**
 * 上传图片接口
 */
exports.uploadImg = async (ctx,next)=>{
    const serverPath = path.join(__dirname, '../../public/uploads/')
    const result = await uploadFile(ctx, {
        fileType: 'album',
        path: serverPath
    })
    const imgPath = path.join(serverPath, result.imgPath)
    const qiniu = await upToQiniu(imgPath, result.imgKey)
    removeTemImage(imgPath)
    let res = {
        imgPath: `http://7xpyje.com1.z0.glb.clouddn.com/${qiniu.key}` + '?imageView2/1/w/400/h/400/q/75|watermark/2/text/5bCP5LiD5Y2a5a6i/font/5a6L5L2T/fontsize/400/fill/I0RBQ0RDRA==/dissolve/48/gravity/SouthEast/dx/10/dy/10|imageslim',         
        imgKey:qiniu.key
    }
    ctx.body = resObj(1,'上传成功',res);  
}

exports.getMdFileContent = async (ctx,next)=>{
    const serverPath = path.join(__dirname, '../../public/uploads/')
    const result = await uploadFile(ctx, {
        fileType: 'album',
        path: serverPath
    })
    const imgPath = path.join(serverPath, result.imgPath)   
    let data = await readMdFile(ctx,imgPath)
    removeTemImage(imgPath)
    ctx.body = resObj(1,'解析成功',data);  
}