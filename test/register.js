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

describe('Test for new user', function() {
	it('Test parameters', function(done) {
		request({
			url : "http://localhost:3000/register",
			method : "POST",
			json : true,
			body : {
				"email"				:	"kalgi.bhatt@yahoo.com",
				"username"			:	sjcl.encrypt(passwordpassword, "kalgibhatt"),
				"password"			:	sjcl.encrypt(passwordpassword, "kalgibhatt"),
				"fname"				:	"Kalgi",
				"lname"				:	"Bhatt",
				"contact"			:	"16692386056",
				"passwordpassword"	:	passwordpassword
			}
		}, function(err, res, body) {
			expect(body.status_code).to.equal(200);
			done();
		});
	});

})