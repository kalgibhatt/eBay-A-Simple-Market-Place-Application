
var logger = require("../utils/logger");

module.exports.sendLoggedInUser = function(req, res) {
	logger.logEntry("common_bo", "sendLoggedInUser");
	res.send({
		"loggedInUser"	:	req.session.loggedInUser
	});
};

module.exports.destroySession = function(req, res) {
	logger.logEntry("common_bo", "destroySession");
	req.session.destroy(function(err) {
		if(err) {
			res.send({
				"status_code"	:	500
			});
		} else {
			res.send({
				"status_code"	:	200
			});
		}
	});
};