var expect = require("chai").expect;
var request = require("request");
var sjcl = require("sjcl");

describe('Test for sign out', function() {
	it('User signed out', function(done) {
		request({
			url : "http://localhost:3000/signoutUser",
			method : "POST",
			json : true
		}, function(err, res, body) {
			expect(body.status_code).to.equal(200);
			done();
		});
	});
})