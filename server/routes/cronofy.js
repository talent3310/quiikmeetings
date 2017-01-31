/**
 * Created by David on 12/14/16.
 */
 
var express = require('express');
var router = express.Router();
var controller = require('../controllers/cronofy')();
var auth = require('../auth/auth.service');

/* set users api. */
router.get('/auth_url', auth.isAuthenticated(), controller.getAuthUrl);
router.post('/save_token', auth.isAuthenticated(), controller.saveToken);
router.post('/refresh_token', auth.isAuthenticated(), controller.refreshToken);
router.get('/events/:date_from/:date_to', auth.isAuthenticated(), controller.getEvents);
router.get('/events/:eventId', auth.isAuthenticated(), controller.getSelectedEvent);
router.get('/createPushNotification', auth.isAuthenticated(), controller.createPushNotification);
router.post('/notification', controller.notification);
module.exports = router;
