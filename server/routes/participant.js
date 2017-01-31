
var express = require('express');
var router = express.Router();
var controller = require('../controllers/participant')();
var auth = require('../auth/auth.service');

/* set users api. */

router.post('/', auth.isAuthenticated(), controller.saveParticipants);
router.get('/:event_id', auth.isAuthenticated(), controller.getParticipants);

module.exports = router;
