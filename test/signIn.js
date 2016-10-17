var expect = require("chai").expect;
var request = require("request");
var sjcl = require("sjcl");

var randomString = function(length) {
	var generatedString = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < length; i++) {
		generatedString += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return generatedString;
};

var passwordpassword = randomString(25);

describe('Login test for new user', function() {
	it('Test username and password', function(done) {
		request({
			url : "http://localhost:3000/signin",
			method : "POST",
			json : true,
			body : {
				"userID" : sjcl.encrypt(passwordpassword, "kalgibhatt"),
				"password" : sjcl.encrypt(passwordpassword, "kalgibhatt"),
				"passwordpassword" : passwordpassword
			}
		}, function(err, res, body) {
			expect(body.valid).to.equal(true);
			done();
		});
	});
	
	it('Test for invalid username and password', function(done) {
		request({
			url : "http://localhost:3000/signin",
			method : "POST",
			json : true,
			body : {
				"userID" : sjcl.encrypt(passwordpassword, "kalgibhatt"),
				"password" : sjcl.encrypt(passwordpassword, "admin123"),
				"passwordpassword" : passwordpassword
			}
		}, function(err, res, body) {
			expect(body.valid).to.equal(false);
			done();
		});
	});

})