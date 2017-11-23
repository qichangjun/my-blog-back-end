var router = require('koa-router')();
var article_controller = require('../../app/controllers/article_controller');

router.post('/createArticle',article_controller.createArticle);
router.post('/getArticleLists',article_controller.getArticleLists);
router.post('/deleteArticle',article_controller.deleteArticle);
router.post('/getOwnarticleLists',article_controller.getOwnarticleLists);
router.post('/updateCheckTimes',article_controller.updateCheckTimes);
router.get('/getArticleDetail',article_controller.getArticleDetail);
router.post('/addReply',article_controller.addReply);
router.post('/addChildReply',article_controller.addChildReply);
router.post('/deleteReply',article_controller.deleteReply);
router.post('/editArticle',article_controller.editArticle);
router.get('/deleteMessage',article_controller.deleteMessage);
module.exports = router