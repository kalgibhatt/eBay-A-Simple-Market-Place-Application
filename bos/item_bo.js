
var rabbitMQ = require('../utils/rabbitMQ');
var logger = require("../utils/logger");

module.exports.viewItem = function(res) {
	logger.logEntry("item_bo", "item");
	res.render('viewItem', {});
};

module.exports.sendBidDetails = function(sale_id, res) {
	logger.logEntry("item_bo", "sendBidDetails");
	rabbitMQ.sendMessage('sendBidDetails', {
		'sale_id' : sale_id
	}, function(payload) {
		res.send({
			"results"		:	payload.bids,
			"futureTime"	:	new Date(payload.bidEndTime)
		});
	});
};

module.exports.sendItemDetails = function(sale_id, res) {
	logger.logEntry("item_bo", "sendItemDetails");
	rabbitMQ.sendMessage('sendItemDetails', {
		'sale_id' : sale_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.placeUserBid = function(user_id, username, item_id, bid_price, bid_qty, res) {
	logger.logEntry("item_bo", "placeUserBid");
	rabbitMQ.sendMessage('placeBid', {
		'user_id' : user_id,
		'username' : username,
		'item_id' : item_id,
		'bid_price' : bid_price,
		'bid_qty' : bid_qty
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.addItemToCart = function(user_id, item, qty, req, res) {
	logger.logEntry("item_bo", "addItemToCart");
	item.sale_qty = qty;
	req.session.loggedInUser.cart.push(item);
	rabbitMQ.sendMessage('addToCart', {
		'user_id' : user_id,
		'item' : item,
		'qty' : qty
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendTotalSold = function(item_id, res) {
	logger.logEntry("item_bo", "sendTotalSold");
	rabbitMQ.sendMessage('sendSold', {
		'item_id' : item_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.addItemToUserSuggestion = function(user_id, item_id, req) {
	logger.logEntry("item_bo", "addItemToUserSuggestion");
	logger.logItemVisit(user_id, item_id);
	rabbitMQ.sendMessage('addToSuggestion', {
		'user_id' : user_id,
		'item_id' : item_id
	}, function(payload) {
		req.session.loggedInUser.suggestions.push(payload.item);
	});
};