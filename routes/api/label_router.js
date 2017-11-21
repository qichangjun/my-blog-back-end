var router = require('koa-router')();
var label_controller = require('../../app/controllers/label_controller');

router.post('/getLabelLists',label_controller.getLabelLists);
router.post('/addLabel',label_controller.addLabel);

module.exports = router