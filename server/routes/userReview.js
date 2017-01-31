

var express = require('express');
var router = express.Router();
var controller = require('../controllers/userReview')();
var auth = require('../auth/auth.service');

/* sets user review api. */

router.post('/', controller.saveReview);
router.get('/events/:thread_id/:event_id?', auth.isAuthenticated(), controller.getReviews);
router.post('/all_reviews', auth.isAuthenticated(), controller.getReviewsOfThreads);
router.post('/send_Review_Link', auth.isAuthenticated(), controller.sendReviewLink);
module.exports = router;
