//Connection Pooling with Mongo: https://groups.google.com/forum/#!msg/node-mongodb-native/mSGnnuG8C1o/Hiaqvdu1bWoJ

var mongodb = require('mongodb');
var logger = require("../utils/logger");
var autoIncrement = require("mongodb-autoincrement");
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://127.0.0.1:27017/eBay';
var db;

module.exports = {
	connect: function(callback) {
		logger.logEntry("mongoDao", "connect");
		//Connection Pooling with Mongo: https://groups.google.com/forum/#!msg/node-mongodb-native/mSGnnuG8C1o/Hiaqvdu1bWoJ
		//Using 'MongoClient.connect' to invoke the connection pooling into MongoDB.
		MongoClient.connect(mongoUrl, function(err, database) {
			if(err) {
				throw err;
			}
			//Using one connection out of the pool!
			db = database;
			callback();
		});
	},
	fetch: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "fetch");
		db.collection(collection).find(queryObject, function(err, cursor) {
			if(err) {
				throw err;
			}
			cursor.toArray(function(err, resultDoc) {
				if(err) {
					throw err;
				}
				callback(resultDoc);
			});
		});
	},
	fetchTop: function(collection, queryObject, sortField, count, callback) {
		logger.logEntry("mongoDao", "fetchTop");
		db.collection(collection).find(queryObject, {sort: {sortField: -1}, limit: count}, function(err, cursor) {
			if(err) {
				throw err;
			}
			cursor.toArray(function(err, resultDoc) {
				if(err) {
					throw err;
				}
				callback(resultDoc);
			});
		});
	},
	fetchOne: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "fetchOne");
		db.collection(collection).findOne(queryObject, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	},
	insert: function(collection, insertObject, callback) {
		logger.logEntry("mongoDao", "insert");
		autoIncrement.getNextSequence(db, collection, function (err, autoIndex) {
			if(err) {
				throw err;
			}
			insertObject._id = autoIndex;
			db.collection(collection).insert(insertObject, {w:1}, function(err, resultDoc) {
				if(err) {
					throw err;
				}
				callback(resultDoc);
			});
		});
	},
	update: function(collection, queryObject, updateObject, callback) {
		logger.logEntry("mongoDao", "update");
		db.collection(collection).update(queryObject, updateObject, {w:1}, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	},
	remove: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "remove");
		db.collection(collection).remove(queryObject, {w:1}, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	}
};