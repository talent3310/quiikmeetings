
var express = require('express');
var router = express.Router();
var controller = require('../controllers/events')();
var auth = require('../auth/auth.service');

/* set users api. */

router.post('/', auth.isAuthenticated(), controller.createEvent);
module.exports = router;
