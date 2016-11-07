
var rabbitMQ = require('../utils/rabbitMQ');
var logger = require('../utils/logger');

module.exports.sendUserSoldItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserSoldItems');
	rabbitMQ.sendMessage('userSold', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendUserBoughtItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserBoughtItems');
	rabbitMQ.sendMessage('userBought', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendUserSaleItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserSaleItems');
	rabbitMQ.sendMessage('userSale', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.updateUserContact = function(user_id, contact, res) {
	logger.logEntry('profile_bo', 'updateUserContact');
	rabbitMQ.sendMessage('updateUserContact', {
		'user' : user_id,
		'contact' : contact
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.updateUserDOB = function(user_id, dob, res) {
	logger.logEntry('profile_bo', 'updateUserDOB');
	rabbitMQ.sendMessage('updateUserDOB', {
		'user' : user_id,
		'dob' : dob
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.addUserAddress = function(user_id, st_address, apt, city, state, country, zip, res) {
	logger.logEntry('profile_bo', 'addUserAddress');
	rabbitMQ.sendMessage('addAddress', {
		'user_id' : user_id,
		'address' : {
			'st_address'		:	st_address,
			'apt'				:	apt,
			'city'				:	city,
			'state'				:	state,
			'country'			:	country,
			'zip'				:	zip
		}
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendUserProfile = function(user_name, res) {
	logger.logEntry('profile_bo', 'sendUserProfile');
	rabbitMQ.sendMessage('sendUserProfile', {
		'user_name' : user_name
	}, function(payload) {
		res.send(payload);
	});
};