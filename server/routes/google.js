/**
 * Created by sohel on 6/27/15.
 */
 
var express = require('express');
var router = express.Router();
var controller = require('../controllers/googleCalendar')();
var auth = require('../auth/auth.service');

/* set users api. */
router.get('/auth_url', auth.isAuthenticated(), controller.getAuthUrl);
router.post('/save_token', auth.isAuthenticated(), controller.saveToken);
router.get('/events/:date_from/:date_to', auth.isAuthenticated(), controller.getEvents);
router.get('/events/:eventId', auth.isAuthenticated(), controller.getSelectedEvent);

module.exports = router;
