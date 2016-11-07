
var rabbitMQ = require('../utils/rabbitMQ');
var logger = require("../utils/logger");

var rabbitMQ = require('../utils/rabbitMQ');

module.exports.homepage = function(res) {
	logger.logEntry("homepage_bo", "homepage");
	res.render("index", {});
};

module.exports.sendUserSearchResults = function(search_string, user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSearchResults");
	rabbitMQ.sendMessage('search', {
		'search_string' : search_string,
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendSearchResults = function(search_string, res) {
	logger.logEntry("homepage_bo", "sendSearchResults");
	rabbitMQ.sendMessage('search', {
		'search_string' : search_string
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendSuggestions = function(res) {
	logger.logEntry("homepage_bo", "sendSuggestions");
	res.send({
		"saleDetails"	:	[]
	});
};

module.exports.sendUserSaleListing = function(user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSaleListing");
	rabbitMQ.sendMessage('sendListing', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendSaleListing = function(res) {
	logger.logEntry("homepage_bo", "sendSaleListing");
	rabbitMQ.sendMessage('sendListing', {}, function(payload) {
		res.send(payload);
	});
};