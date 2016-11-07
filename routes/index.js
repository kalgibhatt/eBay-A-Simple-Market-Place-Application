
var express = require('express');
var router = express.Router();
var logger = require("../utils/logger");
var schedule = require('node-schedule');
var sjcl = require('sjcl');

var common_bo = require('../bos/common_bo');
var homepage_bo = require('../bos/homepage_bo');
var accounts_bo = require('../bos/accounts_bo');
var sell_bo = require('../bos/sell_bo');
var cart_bo = require('../bos/cart_bo');
var profile_bo = require('../bos/profile_bo');
var item_bo = require('../bos/item_bo');

// TODO: Nice Utility for scheduled tasks: https://github.com/ncb000gt/node-cron -- Done
// TODO: Nice tool for scheduling bid end job: https://github.com/node-schedule/node-schedule -- Done

router.get('/payment', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/payment");
	} else {
		logger.logRouteEntry(0, "GET", "/payment");
	}
	cart_bo.payment(res);
});

router.get('/', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/");
	} else {
		logger.logRouteEntry(0, "GET", "/");
	}
	homepage_bo.homepage(res);
});

router.get('/account', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/account");
	} else {
		logger.logRouteEntry(0, "GET", "/account");
	}
	accounts_bo.accounts(res);
});

router.get('/sell', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/sell");
	} else {
		logger.logRouteEntry(0, "GET", "/sell");
	}
	sell_bo.sell(res);
});

router.get('/cart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/cart");
	} else {
		logger.logRouteEntry(0, "GET", "/cart");
	}
	if(req.session.loggedInUser) {
		cart_bo.cart(res);
	} else {
		res.redirect('/');
	}
});

router.get('/viewItem', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/viewItem");
		item_bo.addItemToUserSuggestion(req.session.loggedInUser._id, Number(req.param('itemid')), req);
	} else {
		logger.logRouteEntry(0, "GET", "/viewItem");
	}
	item_bo.viewItem(res);
	
});

router.get('/forgotPassword', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "GET", "/forgotPassword");
	} else {
		logger.logRouteEntry(0, "GET", "/forgotPassword");
	}
	accounts_bo.handleForgotRequest(req.param('email'), res);
});

router.post('/placeBid', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/placeBid");
		item_bo.placeUserBid(req.session.loggedInUser._id, req.session.loggedInUser.username, req.body.bid_item, Number(req.body.bid_price), req.body.bid_qty, res);
	} else {
		logger.logRouteEntry(0, "POST", "/placeBid");
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/emailIDAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/emailIDAvailable");
	} else {
		logger.logRouteEntry(0, "POST", "/emailIDAvailable");
	}
	accounts_bo.checkEmailAvailability(req.body.email, res);
});

router.post('/fetchBidDetails', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchBidDetails");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchBidDetails");
	}
	item_bo.sendBidDetails(req.body.itemid, res);
});

router.post('/updateContact', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/updateContact");
	} else {
		logger.logRouteEntry(0, "POST", "/updateContact");
	}
	profile_bo.updateUserContact(req.body.user, req.body.contact, res);
});

router.post('/updateDOB', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/updateDOB");
	} else {
		logger.logRouteEntry(0, "POST", "/updateDOB");
	}
	profile_bo.updateUserDOB(req.body.user, req.body.dob, res);
});

router.post('/fetchUserProfile', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchUserProfile");
		profile_bo.sendUserProfile(req.body.username, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchUserProfile");
		profile_bo.sendUserProfile(req.body.username, res);
	}
});

router.post('/fetchSoldByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchSoldByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSoldByUser");
	}
	profile_bo.sendUserSoldItems(req.body.user, res);
});

router.post('/fetchBoughtByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchBoughtByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchBoughtByUser");
	}
	profile_bo.sendUserBoughtItems(req.body.user, res);
});

router.post('/fetchSaleByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchSaleByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSaleByUser");
	}
	profile_bo.sendUserSaleItems(req.body.user, res);
});

router.post('/usernameAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/usernameAvailable");
	} else {
		logger.logRouteEntry(0, "POST", "/usernameAvailable");
	}
	accounts_bo.checkUserAvailability(sjcl.decrypt(req.body.passwordpassword, req.body.username), res);
});

router.post('/loggedInUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/loggedInUser");
		common_bo.sendLoggedInUser(req, res);
	} else {
		logger.logRouteEntry(0, "POST", "/loggedInUser");
		res.send({
			"loggedInUser"	:	{}
		});
	}
});

router.post('/checkCartQtyAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/checkCartQtyAvailable");
		cart_bo.sendCartAvailability(req.session.loggedInUser._id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/checkCartQtyAvailable");
		res.redirect('/');
	}
});

router.post('/fetchAddresses', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchAddresses");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchAddresses");
	}
	common_bo.sendAddresses(req.body.user, res);
});

router.post('/checkout', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/checkout");
		cart_bo.checkout(req.session.loggedInUser._id, req, res);
	} else {
		logger.logRouteEntry(0, "POST", "/checkout");
		res.redirect('/');
	}
});

router.post('/addAddress', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/addAddress");
	} else {
		logger.logRouteEntry(0, "POST", "/addAddress");
	}
	profile_bo.addUserAddress(req.body.user_id, req.body.st_address, req.body.apt, req.body.city, req.body.state, req.body.country, req.body.zip, res);
});

router.post('/fetchItemDetails', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchItemDetails");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchItemDetails");
	}
	console.log(">>>>>>>>>>>>>>>>>");
	console.log("req.body.itemid ", req.body.itemid);
	item_bo.sendItemDetails(Number(req.body.itemid), res);
});

router.post('/fetchTransactions', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchTransactions");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchTransactions");
	}
	item_bo.sendTotalSold(Number(req.body.itemid), res);
});

router.post('/fetchCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchCart");
		common_bo.sendUserCartItems(req.session.loggedInUser._id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchCart");
		common_bo.sendCartItems(res);
	}
});

router.post('/removeFromCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/removeFromCart");
		cart_bo.removeFromCart(req.session.loggedInUser._id, req.body.item, req, res);
	} else {
		logger.logRouteEntry(0, "POST", "/removeFromCart");
		res.redirect('/');
	}
});

router.post('/fetchNotifications', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchNotifications");
		common_bo.sendUserNotifications(req.session.loggedInUser._id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchNotifications");
		common_bo.sendNotifications(res);
	}
});

router.post('/addToCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/addToCart");
		item_bo.addItemToCart(req.session.loggedInUser._id, req.body.item, req.body.qty, req, res);
	} else {
		logger.logRouteEntry(0, "POST", "/addToCart");
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/fetchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchSales");
		homepage_bo.sendUserSaleListing(req.session.loggedInUser._id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSales");
		homepage_bo.sendSaleListing(res);
	}
});

router.post('/searchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/searchSales");
		homepage_bo.sendUserSearchResults(req.body.searchString, req.session.loggedInUser._id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/searchSales");
		homepage_bo.sendSearchResults(req.body.searchString, res);
	}
});

router.post('/fetchCategories', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchItems");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchItems");
	}
	sell_bo.sendCategories(res);
});

router.post('/fetchConditions', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/fetchConditions");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchConditions");
	}
	sell_bo.sendConditions(res);
});

router.post('/register', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/register");
	} else {
		logger.logRouteEntry(0, "POST", "/register");
	}
	accounts_bo.register(sjcl.decrypt(req.body.passwordpassword, req.body.username), 
			req.body.email, sjcl.decrypt(req.body.passwordpassword, req.body.password), 
			req.body.fname, req.body.lname, req.body.contact, req.body.dob, res);
});

router.post('/publishSale', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/publishSale");
		sell_bo.publishSale(req.session.loggedInUser._id, req.session.loggedInUser.username, req.body.advertise_title, req.body.advertise_category, 
				req.body.advertise_condition, req.body.advertise_is_bid, req.body.advertise_price, 
				req.body.advertise_quantity, req.body.advertise_desc, res);
	} else {
		logger.logRouteEntry(0, "POST", "/publishSale");
		res.redirect('/');
	}
});

router.post('/signoutUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/signoutUser");
	} else {
		logger.logRouteEntry(0, "POST", "/signoutUser");
	}
	if(req.session) {
		logger.logUserSignout(req.session.loggedInUser._id);
		common_bo.destroySession(req, res);
	}
});

router.post('/signin', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser._id, "POST", "/signin");
	} else {
		logger.logRouteEntry(0, "POST", "/signin");
	}
	accounts_bo.signin(req.body.userID, req.body.password, req, res);
	// accounts_bo.signin(sjcl.decrypt(req.body.passwordpassword, req.body.userID), sjcl.decrypt(req.body.passwordpassword, req.body.password), req, res);
});

router.get('/loginFailure', function(req, res, next) {
	res.send({
		'valid' : false
	});
});

router.get('/loginSuccess', function(req, res, next) {
	res.send({
		'valid' : true
	});
});

module.exports = router;