var express = require('express');
var logger = require('./log.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("here");
	logger.log("debug","Kalgi");
});

router.get('/signup', function(req, res, next) {
	
});

module.exports = router;
