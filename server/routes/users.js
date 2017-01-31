var express = require('express');
var router = express.Router();
var controller = require('../controllers/user')();
var auth = require('../auth/auth.service');

/* set users api. */
router.get('/', auth.isAuthenticated(), controller.getUsers);
router.post('/', controller.saveUser);
router.get('/me', auth.isAuthenticated(), controller.me); 


module.exports = router;
