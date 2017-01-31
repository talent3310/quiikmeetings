/**
 * Created by sohel on 7/6/15.
 */


var express = require('express');
var router = express.Router();
var controller = require('../controllers/eventThread')();
var auth = require('../auth/auth.service');

/* set users api. */
router.get('/', auth.isAuthenticated(), controller.getThreads);
router.get('/thread_details/:thread_id', auth.isAuthenticated(), controller.getThreadDetails);
router.get('/archive/:thread_id', auth.isAuthenticated(), controller.archiveThread);
router.get('/all', controller.getAllThreads);
router.post('/',  auth.isAuthenticated(), controller.saveThread);

module.exports = router;
