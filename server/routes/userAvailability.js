var express = require('express');
var router = express.Router();
var controller = require('../controllers/userAvailability')();
var auth = require('../auth/auth.service');

/* set user availability api. */
router.get('/all', auth.isAuthenticated(),controller.getUserAllAvailabilities);
router.get('/user', auth.isAuthenticated(), controller.getAllAvailabilitiesOfUser);
router.get('/:date', auth.isAuthenticated(), controller.getUserAvailabilities);
router.get('/free_times/:user_id/:date', auth.isAuthenticated(), controller.getUserFreeTimes);
router.get('/free_timesByDateRange/:user_id/:date_From/:date_To',auth.isAuthenticated(),  controller.getUserFreeTimesByDateRange);
router.post('/', auth.isAuthenticated(), controller.saveUserAvailability);
router.post('/send_invites', auth.isAuthenticated(), controller.sendInvitation);


module.exports = router;
