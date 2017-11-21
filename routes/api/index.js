var router = require('koa-router')();
var user_router = require('./user_router');
var art_router = require('./art_router');
var upload_router = require('./upload_router')
var label_router = require('./label_router')
router.prefix('/api')

router.use('/users',user_router.routes(), user_router.allowedMethods())
router.use('/art',art_router.routes(), art_router.allowedMethods())
router.use('/upload',upload_router.routes(),upload_router.allowedMethods())

router.use('/label',label_router.routes(), label_router.allowedMethods())
module.exports = router;