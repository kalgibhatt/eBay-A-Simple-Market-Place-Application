var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
        	level: 'silly',
        	colorize: true,
        	timestamp: true,
        	filename: './logs/logging.log',
        	maxsize: 100000,
        	maxFiles: 1000,
        	logstash: true,
        	tailable: true,
        	zippedArchive: false,
        	json: true,
        	stringify: false,
        	prettyPrint: true,
        	depth: 5,
        	humanReadableUnhandledException: true,
        	showLevel: true,
        	stderrLevels: ['error', 'debug']
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: true,
            timestamp: true,
            prettyPrint: true,
            colorize: true
        })
    ],
    exitOnError: false
});

// Generic Logging - Specific to method and operation
module.exports.genericLog = function(user_id, genericLog) {
	var logString = "Generic: " + genericLog;
	if(user_id !== null && user_id !== undefined && user_id !== 0) {
		logString = logString + " - " + "UserID: " + user_id;
	}
	logger.log("info", logString);
};

// Database interaction logging.
module.exports.logQuery = function(sql) {
	logger.log("debug", "Query: " + sql);
};

// Routes requests logging
module.exports.logRouteEntry = function(user_id, method, route) {
	var logString = "RouteEntered: " + " - " + "Route: " + route + " - " + "Method: " + method;
	if(user_id !== null && user_id !== undefined && user_id !== 0) {
		logString = logString + " - " + "UserID: " + user_id;
	}
	logger.log("debug", logString);
};

// Method Entry Logging
module.exports.logEntry = function(file, method) {
	logger.log("debug", "MethodEntered: " + " - " + "File: " + file + " - " + "Method: " + method);
};

// User Bids Logging
module.exports.logBid = function(bidder_id, item_id, bid_price, bid_qty) {
	logger.log("info", "Bid: " + "Bidder: " + bidder_id + " - " + "Item: " + item_id + " - " + "Price: " + bid_price + " - " + "Qty: " + bid_qty);
};

// User Item Visit Logging
module.exports.logItemVisit = function(user_id, item_id) {
	logger.log("info", "ItemVisit: " + "User: " + user_id + " - " + "Item: " + item_id);
};

// User Profile Visit Logging
module.exports.logUserVisit = function(visitor_id, user_id) {
	logger.log("info", "ProfileVisit: " + "Visitor: " + visitor_id + " - " + "User: " + user_id);
};

// User Adds an Item to Cart
module.exports.logUserCartEntry = function(user_id, item_id, item_qty, item_price) {
	logger.log("info", "CartEntry: " + "User: " + user_id + " - " + "Item: " + item_id + " - " + "Qty: " + item_qty + " - " + "Price: " + item_price);
};

// User Removes an Item from Cart
module.exports.logUserCartRemove = function(user_id, item_id) {
	logger.log("info", "CartRemove: " + "User: " + user_id + " - " + "Item: " + item_id);
};

// User Purchase an Item
module.exports.logUserCheckout = function(user_id, item_id, item_qty, item_price) {
	logger.log("info", "CartCheckout: " + "User: " + user_id + " - " + "Item: " + item_id + " - " + "Qty: " + item_qty + " - " + "Price: " + item_price);
};

// User Sign Out
module.exports.logUserSignout = function(user_id) {
	logger.log("info", "UserSignout: " + "User: " + user_id);
};

// User Sign Out
module.exports.logUserSignin = function(user_id) {
	logger.log("info", "UserSignin: " + "User: " + user_id);
};

// User Name Logs for User Name Statistics
module.exports.logUserName = function(username) {
	logger.log("info", "UserName: " + username);
};

// Passwords for password statistics
module.exports.logPassword = function(password) {
	logger.log("info", "Password: " + password);
};

module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};