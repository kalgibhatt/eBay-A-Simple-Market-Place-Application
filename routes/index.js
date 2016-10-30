var express = require('express');
var router = express.Router();
var dao = require('../utils/dao');
var logger = require("../utils/logger");
var schedule = require('node-schedule');
var sjcl = require('sjcl');
var bcrypt = require("bcrypt");
var mongo = require('./mongo');

// TODO: Nice Utility for scheduled tasks: https://github.com/ncb000gt/node-cron -- Done
// TODO: Nice tool for scheduling bid end job: https://github.com/node-schedule/node-schedule -- Done

router.get('/', function(req, res, next) {
	logger.log('info','Inside homepage get method');
	res.render('index', {  });
});

router.get('/sell', function(req, res, next) {
	logger.log('info','Inside sell page get method');
	res.render('sell', {  });
});

router.get('/payment', function(req, res, next) {
	logger.log('info','Inside payment page get method');
	res.render('payment', { });
});

router.get('/cart', function(req, res, next) {
	logger.log('info','Inside cart page get method');
	if(req.session.loggedInUser) {
		res.render('cart', {  });
	} else {
		res.redirect('/');
	}
});

router.get('/viewItem', function(req, res, next) {
	logger.log('info','Inside item page get method');
	if(req.session.loggedInUser) {
		logger.log('info','User with user ID ' + req.session.loggedInUser.user_id + ' visited page of ' + req.param('itemid'));
		dao.executeQuery("SELECT count(suggestion_id) as entries FROM suggestion_details WHERE user = ? AND suggestion_item = ?", [req.session.loggedInUser.user_id, Number(req.param('itemid'))], function(rows) {
			if(rows.entries !== 0) {
				dao.executeQuery("DELETE FROM suggestion_details WHERE user=? AND suggestion_item=?", [req.session.loggedInUser.user_id, Number(req.param('itemid'))], function(suggestionDetails) {
					dao.insertData("suggestion_details", {
						"user"				:	req.session.loggedInUser.user_id,
						"suggestion_item"	:	Number(req.param('itemid'))
					}, function(rows) {
						// Do nothing
					});
				});
			} else {
				dao.insertData("suggestion_details", {
					"user"				:	req.session.loggedInUser.user_id,
					"suggestion_item"	:	Number(req.param('itemid'))
				}, function(rows) {
					// Do nothing
				});
			}
		});
	}
	res.render('viewItem', {  });
});

router.post('/placeBid', function(req, res, next) {
	logger.log('info','Inside Bid page post method');
	if(req.session.loggedInUser) {
		dao.insertData("bid_details", {
			"sale"			:	req.body.bid_item,
			"bidder"		:	req.session.loggedInUser.user_id,
			"bid_amount"	:	req.body.bid_price,
			"bid_qty"		:	req.body.bid_qty
		}, function(rows) {
			dao.executeQuery("update sale_details set sale_price = ? where sale_id = ?", [req.body.bid_price, req.body.bid_item], function() {
				logger.log('info','Bid on ' + req.body.bid_item + ' by user with user ID ' + req.session.loggedInUser.user_id + 'for' + req.body.bid_price + 'price');
				res.send({
					"status_code"	:	200
				});
			});
		});
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/emailIDAvailable', function(req, res, next) {
	logger.log('info','Inside email ID available page post method');
	dao.executeQuery("SELECT COUNT(email) as count FROM user_account WHERE email like ?", [req.body.email], function(result) {
		if(result[0].count === 0) {
			res.send({
				"available"	:	true
			});
		} else {
			res.send({
				"available"	:	false
			});
		}
	});
});

router.post('/fetchBidDetails', function(req, res, next) {
	logger.log('info','Inside fetch bid details page post method');
	dao.executeQuery("SELECT bid.*, bidder.user_name FROM bid_details AS bid, user_account AS bidder WHERE bid.bidder = bidder.user_id AND sale = ? order by bid.bid_amount desc", [req.body.itemid], function(results) {
		dao.executeQuery("select sale_time from sale_details where sale_id = ?", [req.body.itemid], function(remainingTime) {
			var saleDate = new Date(remainingTime[0].sale_time);
			var bidEnd = Math.abs(saleDate.getTime() + 345600000);
			res.send({
				"results"		:	results,
				"futureTime"	:	new Date(bidEnd)
			});
		});
	});
});

router.post('/updateContact', function(req, res, next) {
	logger.log('info','Inside update contact page post method');
	dao.updateData("user_profile", {
		"contact"	:	req.body.contact
	}, {
		"user"	:	req.body.user
	}, function(update_status) {
		dao.executeQuery("select contact from user_profile where user = ?", [req.body.user], function(profile_details) {
			logger.log('info','User with user ID ' + req.body.user + ' updated contact.');
			res.send({
				"contact"		:	profile_details[0].contact
			});
		});
	});
});

router.post('/updateDOB', function(req, res, next) {
	logger.log('info','Inside update DOB page post method');
	dao.updateData("user_profile", {
		"dob"	:	req.body.dob
	}, {
		"user"	:	req.body.user
	}, function(update_status) {
		dao.executeQuery("select dob from user_profile where user = ?", [req.body.user], function(profile_details) {
			logger.log('info','User with user ID ' + req.body.user + ' updated date of birth.');
			res.send({
				"dob"		:	profile_details[0].dob
			});
		});
	});
});

router.post('/fetchUserProfile', function(req, res, next) {
	logger.log('info','Inside fetch user profile page post method');
	var user_id;
	var user_name;
	var lname;
	var fname;
	var contact;
	var dob;
	dao.executeQuery("select user_name, f_name, l_name, user_id from user_account where user_name = ?", [req.body.username], function(userProfile) {
		logger.log('info','User with user ID ' + req.session.loggedInUser.user_id + ' visited profile of user with user ID ' + userProfile[0].user_id);
		user_id = userProfile[0].user_id;
		user_name = userProfile[0].user_name;
		fname = userProfile[0].f_name;
		lname = userProfile[0].l_name;
		dao.executeQuery("select contact, dob from user_profile where user = ?", [userProfile[0].user_id], function(profile_details) {
			if(profile_details.length) {
				contact = profile_details[0].contact;
				dob = profile_details[0].dob;
			}
			res.send({
				"user_id"		:	user_id,
				"user_name"		:	user_name,
				"lname"			:	lname,
				"fname"			:	fname,
				"contact"		:	contact,
				"dob"			:	dob
			});
		});
	});
});

router.post('/fetchSoldByUser', function(req, res, next) {
	logger.log('info','Inside fetch sold by user page post method');
	dao.executeQuery("select sale_details.title, txn_details.txn_qty, txn_details.transaction_price, txn_details.txn_time from txn_details, sale_details where txn_details.sale = sale_details.sale_id and sale_details.seller = ?", [req.body.user], function(soldItems) {
		res.send({
			"soldItems"	:	soldItems
		});
	});
});

router.post('/fetchBoughtByUser', function(req, res, next) {
	logger.log('info','Inside fetch bought by user page post method');
	dao.executeQuery("select sale_details.title, txn_details.txn_qty, txn_details.transaction_price, txn_details.txn_time from txn_details, sale_details where txn_details.sale = sale_details.sale_id and txn_details.buyer = ?", [req.body.user], function(boughtItems) {
		res.send({
			"boughtItems"	:	boughtItems
		});
	});
});

router.post('/fetchSaleByUser', function(req, res, next) {
	logger.log('info','Inside fetch sale by user page post method');
	dao.executeQuery("select title, sale_price, sale_qty, description, sale_time from sale_details where seller = ? and active=1;", [req.body.user], function(saleItems) {
		res.send({
			"saleItems"	:	saleItems
		});
	});
});

router.post('/usernameAvailable', function(req, res, next) {
	logger.log('info','Inside username available page post method');
	dao.executeQuery("SELECT COUNT(user_name) as count FROM user_account WHERE user_name like ?", [sjcl.decrypt(req.body.passwordpassword, req.body.username)], function(result) {
		if(result[0].count === 0) {
			res.send({
				"available"	:	true
			});
		} else {
			res.send({
				"available"	:	false
			});
		}
	});
});

router.post('/loggedInUser', function(req, res, next) {
	logger.log('info','Inside logged in user page post method');
	if(req.session.loggedInUser) {
		res.send({
			"userBO"	:	req.session.loggedInUser
		});
	} else {
		res.send({
			"userBO"	:	{}
		});
	}
});

router.post('/fetchAddresses', function(req, res, next) {
	logger.log('info','Inside fetch addresses page post method');
	dao.executeQuery("SELECT user_account.f_name, user_account.l_name, location_details.* FROM location_details, user_profile, user_account WHERE location_details.profile = user_profile.profile_id AND user_profile.user = user_account.user_id AND user_account.user_id = ?", [req.body.user], function(results) {
		res.send({
			"addresses"	:	results
		});
	});
});

router.post('/checkout', function(req, res, next) {
	logger.log('info','Inside checkout page post method');
	if(req.session.loggedInUser) {
		var success = true;
		dao.executeQuery("select cart_details.sale_item as sale, cart_details.user as buyer, sale_details.sale_price as transaction_price,  cart_details.cart_qty as txn_qty from cart_details, sale_details where cart_details.sale_item = sale_details.sale_id and user = ?", [req.session.loggedInUser.user_id], function(results) {
			results.forEach(function(purchase) {
				dao.insertData("txn_details", purchase, function(rows) {
					logger.log('info','User with user ID ' + req.session.loggedInUser.user_id + ' purchased ' + purchase[0].sale + '.');
					if(rows.affectedRows !== 1) {
						success = false;
					}
				});
			});
		});
		if(success) {
			dao.executeQuery("delete from cart_details where user = ?", [req.session.loggedInUser.user_id], function(results) {
				res.send({
					"status_code" : 200
				});
			});
		}
	} else {
		res.redirect('/');
	}
});

router.post('/addAddress', function(req, res, next) {
	logger.log('info','Inside add address page post method');
	dao.fetchData("profile_id", "user_profile", {
		"user"	:	req.body.user_id
	}, function(profile_ids) {
		dao.insertData("location_details", {
			"st_address"		:	req.body.st_address,
			"apt"		:	req.body.apt,
			"city"		:	req.body.city,
			"state"		:	req.body.state,
			"country"	:	req.body.country,
			"zip"		:	req.body.zip,
			"profile"	:	profile_ids[0].profile_id
		}, function(rows) {
			if(rows.affectedRows === 1) {
				res.send({
					"status_code"	:	200
				});
			} else {
				res.send({
					"status_code"	:	500
				});
			}
		});
	});
});

router.post('/fetchItemDetails', function(req, res, next) {
	logger.log('info','Inside fetch item details page post method');
	dao.executeQuery("select is_bid from sale_details where sale_id = ?", [req.body.itemid], function(results) {
		if(results[0].is_bid) {
			dao.executeQuery("select active from sale_details where sale_id = ?", [req.body.itemid], function(activeStatus) {
				if(activeStatus[0].active === 1) {
					dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [req.body.itemid], function(results) {
						res.send({
							"item_id" : results[0].sale_id,
							"item_title" : results[0].title,
							"item_description" : results[0].description,
							"item_condition" : results[0].condition_name,
							"available_quantity" : results[0].sale_qty,
							"is_bid" : results[0].is_bid,
							"current_price" : results[0].sale_price,
							"item_seller_fname" : results[0].f_name,
							"item_seller_lname" : results[0].l_name,
							"item_seller_handle" : results[0].user_name,
							"item_seller_id" : results[0].user_id
						});
					});
				} else {
					res.send({
						"item_id"	:	-1
					});
				}
			});
		} else {
			dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [req.body.itemid], function(results) {
				res.send({
					"item_id" : results[0].sale_id,
					"item_title" : results[0].title,
					"item_description" : results[0].description,
					"item_condition" : results[0].condition_name,
					"available_quantity" : results[0].sale_qty,
					"is_bid" : results[0].is_bid,
					"current_price" : results[0].sale_price,
					"item_seller_fname" : results[0].f_name,
					"item_seller_lname" : results[0].l_name,
					"item_seller_handle" : results[0].user_name,
					"item_seller_id" : results[0].user_id
				});
			});
		}
	});
});

router.post('/fetchTransactions', function(req, res, next) {
	logger.log('info','Inside fetch transactions page post method');
	dao.executeQuery("select sum(txn_id) as totalCount from txn_details where sale = ?", [req.body.itemid], function(results) {
		res.send({
			"total_sold" : results[0].totalCount
		});
	});
});

router.post('/fetchCart', function(req, res, next) {
	logger.log('info','Inside fetch cart page post method');
	if(req.session.loggedInUser) {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('cart_details').find({
			"seller"	:	req.session.loggedInUser.user_name,
			"sale_item"		:	sale_id
		}, function(err,result) {
		//dao.executeQuery("SELECT seller.user_name, sale.sale_id, sale.title, condi.condition_name, cart.cart_qty, sale.sale_price FROM cart_details AS cart, sale_details AS sale, user_account AS seller, item_conditions AS condi WHERE condi.condition_id = sale.condition AND cart.sale_item = sale.sale_id AND seller.user_id = sale.seller AND cart.user = ?", [req.session.loggedInUser.user_id], function(results) {
			result.toArray(function(err, cart_items) {
				res.send({
					"cart_items" : cart_items
				});
			});
		});
		});
	} else {
		res.send({
			"cart_items" : []
		});
	}           
});

router.post('/removeFromCart', function(req, res, next) {
	logger.log('info','Inside remove from cart page post method');
	if(req.session.loggedInUser) {
		dao.executeQuery("delete from cart_details where user = ? and sale_item = ?", [req.session.loggedInUser.user_id, req.body.item], function(results) {
			logger.log('info',req.session.loggedInUser.user_id + ' removed ' + req.body.item + ' from cart.');
			res.send({ });
		});
	} else {
		res.redirect('/');
	}
});

router.post('/removeAddress', function(req, res, next) {
	logger.log('info','Inside remove address page post method');
	if(req.session.loggedInUser) {
		dao.executeQuery("select profile_id from user_profile where user = ?", [req.session.loggedInUser.user_id], function(results) {
			dao.executeQuery("delete from location_details where profile = ? and location_id = ?", [results[0].profile_id, req.body.location_id], function(results) {
				res.send({ });
			});
		});
	} else {
		res.redirect('/');
	}
});

router.post('/fetchNotifications', function(req, res, next) {
	logger.log('info','Inside fetch notifications page post method');
	if(req.session.loggedInUser) {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		db.collection('notification_details').find().toArray(function(err,results) {
			res.send({
				"notifications" : results
			});
		});
		});
	} else {
		res.send({
			"notifications" : []
		});
	}
});

router.post('/addToCart', function(req, res, next) {
	logger.log('info','Inside add to cart page post method');
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT count(cart_item_id) as entries FROM cart_details WHERE user = ? AND sale_item = ?", [req.session.loggedInUser.user_id, req.body.itemid], function(results) {
			if(results[0].entries > 0) {
				dao.executeQuery("UPDATE cart_details SET `cart_qty` = ? WHERE `user` = ? AND `sale_item` = ?", [Number(results[0].entries) + Number(req.body.qty), req.session.loggedInUser.user_id, req.body.itemid], function(update_status) {
					logger.log('info','User with user ID ' + req.session.loggedInUser.user_id + ' added ' + req.body.itemid + ' to cart.');
					if(update_status.affectedRows === 1) {
						res.send({
							"status_code"	:	200
						});
					} else {
						res.send({
							"status_code"	:	500
						});
					}
				});
			} else {
				dao.insertData("cart_details", {
					"user"		:	req.session.loggedInUser.user_id,
					"sale_item"	:	req.body.itemid,
					"cart_qty"	:	req.body.qty
				}, function(rows) {
					if(rows.affectedRows === 1) {
						res.send({
							"status_code"	:	200
						});
					} else {
						res.send({
							"status_code"	:	500
						});
					}
				});
			}
		});
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/fetchSales', function(req, res, next) {
	logger.log('info','Inside fetch sales page post method');
	if(req.session.loggedInUser) {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('userAccount').find({
			"seller"	:	{$ne:req.session.loggedInUser.user_name},
			"active"	:	1
		}, function(err,result) {
			result.sort({sale_id: -1}).toArray(function(err, saleDetails) {
				res.send({
					"saleDetails"	:	saleDetails
				});
			});
		});
		});
	} else {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('sale_details').find({
			"active"	:	1
		}, function(err,result) {
			result.sort({sale_id: -1}).toArray(function(err, saleDetails) {
				res.send({
					"saleDetails"	:	saleDetails
				});
			});
		});
		});
	}
});

router.post('/searchSales', function(req, res, next) {
	logger.log('info','Inside search sales page post method');
	if(req.session.loggedInUser) {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('sale_details').find({
			'seller'	:	{$ne:req.session.loggedInUser.user_name},
		    'title'		:	req.body.searchString
		}, function(err,result) {
			result.sort({sale_id: -1}).toArray(function(err, saleDetails) {
				res.send({
					"saleDetails"	:	saleDetails
				});
			});
		});
		});
	} else {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('sale_details').find({
			'title'		:	req.body.searchString
		}, function(err,result) {	
			result.sort({sale_id: -1}).toArray(function(err, saleDetails) {
				res.send({
					"saleDetails"	:	saleDetails
				});
			});
		});
		});
	}
});

router.post('/fetchSuggestions', function(req, res, next) {
	logger.log('info','Inside fetch suggestions page post method');
	if(req.session.loggedInUser) {
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('suggestion_details').find({
			"seller"	:	req.session.loggedInUser.user_name,
			"active"	:	1
		}, function(err,result) {
		//dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale, suggestion_details as suggestions WHERE seller = user_id AND seller <> ? AND suggestions.user = ? AND sale.active = 1 AND suggestions.suggestion_item = sale.sale_id order by sale_id desc LIMIT 4", [req.session.loggedInUser.user_id, req.session.loggedInUser.user_id], function(suggestionDetails) {
			result.sort({sale_id: -1}, {limit: 4}).toArray(function(err, suggestionDetails) {
				res.send({
					"suggestionDetails"	:	suggestionDetails
				});
			});
		});
		});
	} else {
		res.send({
			"saleDetails"	:	[]
		});
	}
});

router.post('/fetchItems', function(req, res, next) {
	logger.log('info','Inside fetch items page post method');
	mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('item_type').find().toArray(function(err, rows) {
			res.send({
				"result"	:	rows
			});
		});
	});
});

router.post('/fetchConditions', function(req, res, next) {
	logger.log('info','Inside fetch conditions page post method');
	mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('item_conditions').find().toArray(function(err, rows) {
			res.send({
				"result"	:	rows
			});
		});
	});
});

router.get('/account', function(req, res, next) {
	logger.log('info','Inside account page post method');
	res.render('account', {  });
});

router.post('/register', function(req, res, next) {
	logger.log('info','Inside register page post method');
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	var salt = bcrypt.genSaltSync(10);
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.username);
	var email = req.body.email;
	var secret = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	var firstname = req.body.fname;
	var lastname = req.body.lname;
	var phone = req.body.contact;
	var username_validator = new RegExp("^[a-z0-9_-]{3,16}$");
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/ -- Done
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var phone_validator = new RegExp(/^(\d{11,12})$/);
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask -- Done
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/ -- Done
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html -- Done
	
	if(username.match(username_validator) === null) {
		logger.log("info", "Invalid username: " + username);
		error_messages.push("'" + username + "' is not a valid username.");
		status_code = 400;
	}
	
	if(email.match(email_validator) === null) {
		logger.log("info", "Invalid email: " + email);
		error_messages.push("'" + email + "' is not a valid email.");
		status_code = 400;
	}
	
	if(firstname.match(firstname_validator) === null) {
		logger.log("info", "Invalid firstname: " + firstname);
		error_messages.push("'" + firstname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(lastname.match(lastname_validator) === null) {
		logger.log("info", "Invalid lastname: " + lastname);
		error_messages.push("'" + lastname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(phone.match(phone_validator) === null) {
		logger.log("info", "Invalid phone: " + phone);
		error_messages.push("'" + phone + "' is not a valid phone.");
		status_code = 400;
	}
	if(status_code === 200) {
		logger.log("info", "Valid parameters");
		
		mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
			var collection = db.collection('userAccount');
		
		collection.insert( {
				"user_name"	:	username,
				"f_name"	:	firstname,
				"l_name"	:	lastname,
				"email"		:	email,
				"secret"	:	bcrypt.hashSync(secret, salt),
				"salt"		:	salt,
				"last_login":	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
			}, function(err,rows) {
			if(rows.result.ok === 1) {
				var collection = db.collection('user_profile');
				collection.insert( {
					"contact"	:	phone,
					"user"		:	rows.insertedIds
				}, function(err,rows) {
					console.log(rows);
					if(rows.result.ok === 1) {
						success_messages.push("User " + firstname + " created successfully !");
						res.send({
							"status_code"	:	status_code,
							"messages"		:	success_messages
						});
					} else {
						error_messages.push("Internal error. Please try again..!!");
						res.send({
							"status_code"	:	status_code,
							"messages"		:	error_messages
						});
					}
				});
			} else {
				error_messages.push("Internal error. Please try again..!!");
				res.send({
					"status_code"	:	status_code,
					"messages"		:	error_messages
				});
			}
		});
	});
	} else {
		res.send({
			"status_code"	:	status_code,
			"messages"		:	error_messages
		});
	}
	
});

router.post('/publishSale', function(req, res, next) {
	logger.log('info','Inside publish sale page post method');
	var title = req.body.advertise_title;
	var item = req.body.advertise_item;
	var condition = req.body.advertise_condition;
	var is_bid = req.body.advertise_is_bid;
	var price = req.body.advertise_price;
	var quantity = req.body.advertise_quantity;
	var description = req.body.advertise_desc;
	
	mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var collection = db.collection('sale_details');
	
	collection.insert( {
		"seller"	:	req.session.loggedInUser.user_id,
		"item"		:	item,
		"condition"	:	condition.condition_id,
		"sale_price":	price,
		"title"		:	title,
		"description"		:	description,
		"is_bid"	:	(is_bid ? 1 : 0),
		"sale_qty"	:	quantity,
		"active"	:	1
	}, function(err,rows) {
		if(rows.result.ok === 1) {
//			var today = new Date();
//			var j = schedule.scheduleJob(today.addDays(4), );
			setTimeout(function() {
				if(is_bid) {
					mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
						var user = db.collection('sale_details').update({
							'active'		: 	0
							}, {
								$set:	{
									"sale_id"	:	rows.insertedIds
								}
							}, function(err,update_status) {
								db.collection('bid_details').find({
								    "sale"		:	rows.insertedIds
								}).limit(1).sort({
								    "bid_amount": -1
								}, function(top_bid) {
									if(top_bid.length) {
										var user = db.collection('sale_details').find( {
											"sale_id"	:	rows.insertedIds
										}, function(err,sale_qty) {
											var user = db.collection('sale_details').update({
												"sale_qty"	:	Number(sale_qty[0].sale_qty) - Number(top_bid[0].bid_qty)
											}, {
												$set:	{
												"sale_id"	:	rows.insertedIds
												}
											}, function(err,update_status) {
												var collection = db.collection('txn_details');
												collection.insert( {
													"sale"				:	rows.insertedIds,
													"buyer"				:	top_bid[0].bidder,
													"transaction_price"	:	top_bid[0].bid_amount,
													"txn_qty"			:	top_bid[0].bid_qty
												}, function(err,rows) {
													var collection = db.collection('notification_details');
													collection.insert( {
														"notification_msg"	:	"Your won the highest bid !!! " + title,
														"user_id"			:	top_bid[0].bidder
													}, function(err,rows) {
														//Do nothing
													});
												});
											});
										});
									}
								});
								});
					});
				}
			}, 345600000);
			res.send({
				"status_code"	:	"200"
			});
		} else {
			res.send({
				"status_code"	:	"500"
			});
		}
	});
	});
});

router.get('/forgotPassword', function(req, res, next) {
	logger.log('info','Inside forgot password page post method');
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	logger.log("info", "Forgot Password form");
	var email = req.param('email'); 
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	if(email.match(email_validator) !== null) {
		dao.fetchData("count(user_id) as matches", "user_account", {
			"email"	:	email
		}, function(rows) {
			if(Number(rows[0].matches) > 0) {
				// TODO: Send an email to 
			} else {
				error_messages.push("Email ID not found in our records.");
				status_code = 400;
			}
		});
	} else {
		error_messages.push("Not valid Email ID");
		status_code = 400;
	}
});

router.post('/signoutUser', function(req, res, next) {
	logger.log('info','Inside sign out user page post method');
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
});

router.post('/signin', function(req, res, next) {
	logger.log('info','Inside sign in page post method');
	var passwordpassword = req.body.passwordpassword;
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.userID);
	var password = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	
	mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
		var user = db.collection('userAccount').findOne({
			"user_name"	:	username
		}, function(err,id_details) {
			if(bcrypt.hashSync(password, id_details.salt) === id_details.secret) {
				logger.log('info','User with user ID ' + id_details.user_name + ' has signed in.');
				req.session.loggedInUser = id_details;
				mongo.connect('mongodb://localhost:27017/eBay-A-Simple-Market-Place-Application', function(db) {
					var user = db.collection('userAccount').update({
						'user_name'		: 	req.session.loggedInUser.user_name
					}, {
						$set:	{
							"last_login"	:	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
						}
					}, function(err,update_status) {
						if(update_status.result.ok === 1) {
							res.send({
								"valid"			:	true,
								"last_login"	:	id_details.last_login
							});
						}
					});
				});
			} else {
				res.send({
					"valid"	:	false
				});
			}
		});
	});
});

module.exports = router;
