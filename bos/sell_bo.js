
var rabbitMQ = require('../utils/rabbitMQ');
var logger = require('../utils/logger');

module.exports.sell = function(res) {
	logger.logEntry('sell_bo', 'sell');
	res.render('sell', {});
};

module.exports.sendConditions = function(res) {
	logger.logEntry('sell_bo', 'sendConditions');
	rabbitMQ.sendMessage('conditions', {}, function(payload) {
		res.send({
			'result'	:	payload.conditions
		});
	});
};

module.exports.sendCategories = function(res) {
	logger.logEntry('sell_bo', 'sendCategories');
	rabbitMQ.sendMessage('categories', {}, function(payload) {
		res.send({
			'result'	:	payload.categories
		});
	});
};

module.exports.publishSale = function(user_id, username, title, category, condition, is_bid, price, quantity, description, res) {
	logger.logEntry('sell_bo', 'publishSale');
	rabbitMQ.sendMessage('publishSale', {
		'seller_id'		:	user_id,
		'seller'		:	username,
		'category'		:	category,
		'condition'		:	condition,
		'sale_price'	:	price,
		'title'			:	title,
		'description'	:	description,
		'sale_qty'		:	quantity,
		'is_bid'		:	is_bid,
		'bids'			:	[],
		'active'		:	true,
		'sale_time'		:	new Date().getTime()
	}, function(payload) {
		if(payload.success) {
			if(is_bid) {
				setTimeout(function() {
					rabbitMQ.sendMessage('bidEndProcess', {
						'sale_id' : payload.inserted_sale
					}, function(payload) {
						// Do nothing
					});
					
				// }, 345600000);
				// }, 120000);
				// }, 60000);
				}, 0);
			}
			res.send({
				'status_code' : 200
			});
		} else {
			res.send({
				'status_code' : 500
			});
		}
	});
};