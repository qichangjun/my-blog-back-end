var router = require('koa-router')();
var upload_controller = require('../../app/controllers/upload_controller');

router.post('/uploadImg',upload_controller.uploadImg);
router.post('/getMdFileContent',upload_controller.getMdFileContent);
module.exports = router