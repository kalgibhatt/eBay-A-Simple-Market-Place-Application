
var rabbitMQ = require('../utils/rabbitMQ');
var logger = require("../utils/logger");

module.exports.cart = function(res) {
	logger.logEntry("cart_bo", "cart");
	res.render('cart', {});
};

module.exports.payment = function(res) {
	logger.logEntry("cart_bo", "payment");
	res.render('payment', {});
};

module.exports.checkout = function(user_id, req, res) {
	logger.logEntry("cart_bo", "checkout");
	var success = true;
	rabbitMQ.sendMessage('checkout', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.sendCartAvailability = function(user_id, res) {
	logger.logEntry("cart_bo", "sendCartAvailability");
	var available = true;
	rabbitMQ.sendMessage('cartAvailability', {
		'user_id' : user_id
	}, function(payload) {
		res.send(payload);
	});
};

module.exports.removeFromCart = function(user_id, item_id, req, res) {
	logger.logEntry("cart_bo", "removeFromCart");
	rabbitMQ.sendMessage('removeFromCart', {
		'user_id' : user_id,
		'item_id' : item_id
	}, function(payload) {
		var cartSize = req.session.loggedInUser.cart.length;
		for(var i = 0; i < cartSize; i++) {
			if(req.session.loggedInUser.cart[i]._id == item_id) {
				req.session.loggedInUser.cart.splice(i, 1);
				cartSize--;
				i--;
			}
		}
		logger.logUserCartRemove(user_id, item_id);
		res.send({ });
	});
};