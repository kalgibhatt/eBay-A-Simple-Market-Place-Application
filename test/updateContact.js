var expect = require("chai").expect;
var request = require("request");
var sjcl = require("sjcl");

describe('Test for user contact updated', function() {
	it('User contact updated', function(done) {
		request({
			url : "http://localhost:3000/updateContact",
			method : "POST",
			json : true,
			body : {
				"user"		: 	1,
				"contact"	:	"16692375784"
			}
		}, function(err, res, body) {
			expect(body.contact).to.equal(16692375784);
			done();
		});
	});
})