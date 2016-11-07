
var LocalStrategy = require('passport-local').Strategy;
var rabbitMQ = require('./rabbitMQ.js');

module.exports = function(passport) {
	passport.use('login', new LocalStrategy({
		usernameField : 'userID',
		passwordField : 'password',
		passReqToCallback : false
	}, function(username, password, done) {
		console.log("Here");
		process.nextTick(function() {
			rabbitMQ.sendMessage('authenticate', {
				'username' : username,
				'password' : password
			}, function(isValid) {
				if(isValid.valid) {
					rabbitMQ.sendMessage('getUser', {
						'userid' : isValid.userid
					}, function(userDetails) {
						done(null, userDetails);
					});
				} else {
					done("Invalid Credentials!", null);
				}
			});
		});
	}));

	// passport.use(new LocalStrategy(function(username, password, done) {
	// 	process.nextTick(function() {
	// 		rabbitMQ.sendMessage('authenticate', {
	// 			'username' : username,
	// 			'password' : password
	// 		}, function(isValid) {
	// 			if(isValid.valid) {
	// 				logger.logUserSignin(isValid.userid);
	// 				rabbitMQ.sendMessage('getUser', {
	// 					'userid' : isValid.userid
	// 				}, function(userDetails) {
	// 					done(null, userDetails);
	// 				});
	// 			}
	// 		});
	// 	});
	// }));
}