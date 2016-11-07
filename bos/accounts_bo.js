
var logger = require('../utils/logger');
var rabbitMQ = require('../utils/rabbitMQ');
var bcrypt = require("bcrypt");
var passport = require('passport');

module.exports.accounts = function(res) {
	logger.logEntry('accounts_bo', 'accounts');
	res.render('account', {});
};

module.exports.signin = function(username, password, req, res) {
	logger.logEntry('accounts_bo', 'signin');
	passport.authenticate('login', function(err, userDetails) {
	    if(err || !userDetails) {
	    	return res.send({
				'valid' : false
			});
	    }

	    req.logIn(userDetails, {
	    	session:false
	    }, function(err) {
	    	if(err) {
	    		return res.send({
	    			'valid' : false
	    		});
	    	}
	    	req.session.loggedInUser = userDetails;
	    	rabbitMQ.sendMessage('updateLastLoggedIn', {
	    		'userid' : userDetails._id
	    	}, function(payload) {
	    		if(payload.success) {
	    			return res.send({
			    		'valid' : true,
			    		'last_login' : userDetails.last_login
			    	});
	    		} else {
	    			return res.send({
	    				'valid' : false
	    			});
	    		}
	    	});
	    });
	})(req, res);
	//Regular login Logic without Passport.js
	// rabbitMQ.sendMessage('authenticate', {
	// 	'username' : username,
	// 	'password' : password
	// }, function(isValid) {
	// 	if(isValid.valid) {
	// 		logger.logUserSignin(isValid.userid);
	// 		rabbitMQ.sendMessage('getUser', {
	// 			'userid' : isValid.userid
	// 		}, function(userDetails) {
	// 			req.session.loggedInUser = userDetails;
	// 			rabbitMQ.sendMessage('updateLastLoggedIn', {
	// 				'userid' : userDetails._id
	// 			}, function(payload) {
	// 				if(payload.success) {
	// 					res.send({
	// 						'valid' : true
	// 					});
	// 				} else {
	// 					res.send({
	// 						'valid' : false
	// 					});
	// 				}
	// 			});
	// 		});
	// 	}
	// });
};

module.exports.register = function(username, email, secret, firstname, lastname, phone, dob, res) {
	logger.logEntry('accounts_bo', 'register');
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/ -- Done
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask -- Done
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/ -- Done
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html -- Done
	
	var error_messages = [];
	var success_messages = [];
	var salt = bcrypt.genSaltSync(10);
	logger.logUserName(username);
	logger.logPassword(secret);
	rabbitMQ.sendMessage('register', {
		'username'		:	username,
		'f_name'		:	firstname,
		'l_name'		:	lastname,
		'email'			:	email,
		'addresses'		:	[],
		'cart'			:	[],
		'suggestions'	:	[],
		'notifications'	:	[],
		'cc_details'	:	[],
		'secret'		:	bcrypt.hashSync(secret, salt),
		'salt'			:	salt,
		'last_login'	:	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss'),
		'contact'		:	phone,
		'dob'			:	dob
	}, function(payload) {
		if(payload.success) {
			success_messages.push('User ' + firstname + ' created successfully !');
			res.send({
				'status_code'	:	200,
				'messages'		:	success_messages
			});
		} else {
			error_messages.push('Internal error. Please try again..!!');
			res.send({
				'status_code'	:	400,
				'messages'		:	error_messages
			});
		}
	});
};

module.exports.checkEmailAvailability = function(email, res) {
	logger.logEntry('accounts_bo', 'checkEmailAvailability');
	rabbitMQ.sendMessage('checkEmailAvailability', {
		'email' : email
	}, function(payload) {
		if(payload.available) {
			res.send({
				'available'	:	true
			});
		} else {
			res.send({
				'available'	:	false
			});
		}
	});
};

module.exports.checkUserAvailability = function(username, res) {
	logger.logEntry('accounts_bo', 'checkUserAvailability');
	rabbitMQ.sendMessage('checkUserAvailability', {
		'username' : username
	}, function(payload) {
		if(payload.available) {
			res.send({
				'available'	:	true
			});
		} else {
			res.send({
				'available'	:	false
			});
		}
	});
};

module.exports.handleForgotRequest = function(email, res) {
	logger.logEntry('accounts_bo', 'handleForgotRequest');
	// var error_messages = [];
	// var status_code = 200;
	// var success_messages = [];
	// var email_validator = new RegExp('^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$');
	// if(email.match(email_validator) !== null) {
	// 	mongoDao.fetchOne('UserDetails', {
	// 		'email' : email
	// 	}, function(resultDoc) {
	// 		if(resultDoc) {
	// 			// TODO: Send an email to user -- Not going to implement
	// 		} else {
	// 			error_messages.push('Email ID not found in our records.');
	// 			status_code = 400;
	// 		}
	// 	});
	// } else {
	// 	error_messages.push('Not valid Email ID');
	// 	status_code = 400;
	// }
};