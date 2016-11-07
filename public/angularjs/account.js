var eBay = angular.module('eBay', ['internationalPhoneNumber', 'ngAnimate', 'focus-if']);
// Watching multiple fields with AngularJS: http://stackoverflow.com/questions/17872919/can-i-combine-watching-of-multiple-fields-into-one-watch-with-angularjs
eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('account', function($scope, $http, $location, $window, Random) {
	$scope.randomPassword = Random.randomString(25);
	$scope.message = "";
	$scope.show_more = true;
	
	$scope.changeToSignin = function() {
		if($location.search().redir) {
			$location.url("/account?view=signin&redir="+$location.search().redir);
		} else {
			$location.url("/account?view=signin");
		}
		$scope.isSignin = true;
		$scope.isSignup = false;
		$scope.isForgot = false;
		$scope.messages = [];
	};
	
	$scope.changeToRegister = function() {
		if($location.search().redir) {
			$location.url("/account?view=register&redir="+$location.search().redir);
		} else {
			$location.url("/account?view=register");
		}
		$scope.isSignin = false;
		$scope.isSignup = true;
		$scope.isForgot = false;
		$scope.messages = [];
	};
	
	$scope.changeToForgot = function() {
		if($location.search().redir) {
			$location.url("/account?view=forgot&redir="+$location.search().redir);
		} else {
			$location.url("/account?view=forgot");
		}
		$scope.isSignin = false;
		$scope.isSignup = false;
		$scope.isForgot = true;
		$scope.messages = [];
	};
	
	$scope.homepage = function() {
		$window.location.href = "/";
	};
	
	if($location.search().view === "register") {
		$scope.changeToRegister();
	} else if($location.search().view === "signin") {
		$scope.changeToSignin();
	} else if($location.search().view === "forgot") {
		$scope.changeToForgot();
	} else {
		$scope.changeToSignin();
	}
	
});

eBay.controller('signinController', function($scope, $http, $window, $location) {
	$scope.signin = function() {
		$scope.$parent.messages = [];
		if($scope.userID !== undefined && $scope.userID.trim() !== "" && $scope.password !== undefined && $scope.password.trim() !== "") {
			$http({
				method	:	"POST",
				url		:	"/signin",
				data	:	{
					"userID"			:	$scope.userID,
					"password"			:	$scope.password
				}
			}).success(function(data) {
				if(Boolean(data.valid)) {
					if($location.search().redir === undefined) {
						$window.location.href = "/?last_login="+data.last_login;
					} else {
						var redir = $location.search().redir.split("-");
						if(redir.length > 1) {
							$window.location.href = "/" + redir[0] + "?" + redir[1] + "=" + redir[2];
						} else {
							$window.location.href = "/" + redir[0];
						}
					}
				} else {
					$scope.$parent.messages.push("Oops, that's not a match!");
				}
			}).error(function(error) {
				$scope.$parent.messages.push("Oops, something went wrong behind the scenes, please try again!");
			});
		} else {
			$scope.$parent.messages.push("Please enter username and password to login!");
		}
	};
});

eBay.controller('registerController', function($scope, $http, $location) {
	$scope.register = function() {
		$scope.$parent.messages = [];
		if($scope.emailAvailable && $scope.userAvailable && $scope.validContact && $scope.validNames && $scope.validContact) {
			$http({
				method	:	"POST",
				url		:	"/register",
				data	:	{
					"email"				:	$scope.email,
					"username"			:	$scope.username,
					"password"			:	$scope.password,
					"fname"				:	$scope.fname,
					"lname"				:	$scope.lname,
					"contact"			:	$scope.contact,
					"dob"				:	$scope.dob,
					"passwordpassword"	:	$scope.$parent.randomPassword
				}
			}).success(function(data) {
				if(data.status_code === 200) {
					if($location.search().redir) {
						$location.url("/account?view=signin&redir="+$location.search().redir);
					} else {
						$location.url("/account?view=signin");
					}
					$scope.$parent.isSignin = true;
					$scope.$parent.isSignup = false;
					$scope.$parent.isForgot = false;
					$scope.$parent.messages = data.messages;
				} else {
					if($location.search().redir) {
						$location.url("/account?view=register&redir="+$location.search().redir);
					} else {
						$location.url("/account?view=register");
					}
					$scope.$parent.messages = data.messages;
					$scope.$parent.isSignin = false;
					$scope.$parent.isSignup = true;
					$scope.$parent.isForgot = false;
				}
			}).error(function(error) {
				$scope.$parent.messages.push("Oops, something went wrong behind the scenes, please try again!");
			});
		} else {
			$scope.$parent.messages.push("Please enter valid values of all the fields!");
		}
	};
	
	$scope.$watch('email', function() {
		if($scope.email !== undefined && $scope.email !== "") {
			$http({
				method	:	"POST",
				url		:	"/emailIDAvailable",
				data	:	{
					"email"	:	$scope.email
				}
			}).success(function(data) {
				if(Boolean(data.available)) {
					$scope.emailAvailable = true;
				} else {
					$scope.emailAvailable = false;
				}
			}).error(function(error) {
				// Do Nothing
			});
		}
	});
	
	$scope.$watch('username', function() {
		if($scope.username !== undefined && $scope.username !== "") {
			$http({
				method	:	"POST",
				url		:	"/usernameAvailable",
				data	:	{
					"username"			:	$scope.username,
					"passwordpassword"	:	$scope.$parent.randomPassword
				}
			}).success(function(data) {
				if(Boolean(data.available)) {
					$scope.userAvailable = true;
				} else {
					$scope.userAvailable = false;
				}
			}).error(function(error) {
				// Do Nothing
			});
		}
	});
	
	$scope.$watch('password', function() {
		var password_validator = new RegExp(/^[A-Za-z0-9_-]{6,18}$/);
		if($scope.password !== undefined && $scope.password !== "") {
			if(sjcl.decrypt($scope.$parent.randomPassword, $scope.password).match(password_validator) !== null) {
				$scope.validPassword = true;
			} else {
				$scope.validPassword = false;
			}
		}
	});
	
	$scope.$watch('contact', function() {
		var contact_validator = new RegExp(/^(\d{11,12})$/);
		if($scope.contact !== undefined && $scope.contact !== "") {
			if($scope.contact.match(contact_validator) !== null) {
				$scope.validContact = true;
			} else {
				$scope.validContact = false;
			}
		}
	});

	$scope.$watch('dob', function() {
		// var contact_validator = new RegExp(/^(\d{11,12})$/);
		if($scope.dob !== undefined && $scope.dob !== "") {
			// if($scope.dob.match(contact_validator) !== null) {
				$scope.validDob = true;
			// } else {
				// $scope.validContact = false;
			// }
		} else {
			// $scope.validDob = false;
		}
	});
	
	$scope.$watchCollection('[fname, lname]', function() {
		var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
		var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
		if($scope.fname !== undefined && $scope.lname !== undefined && $scope.fname !== "" && $scope.lname !== "") {
			if($scope.fname.match(firstname_validator) !== null && $scope.lname.match(lastname_validator) !== null) {
				$scope.validNames = true;
			} else {
				$scope.validNames = false;
			}
		}
	});
	
});

eBay.controller('forgotController', function($scope, $http) {
	$scope.forgot = function() {
		// SMTP Server not implemented. :P
	};
});

eBay.directive('ngEncrypt', function(){
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.push(function(value){
                return sjcl.encrypt(scope.randomPassword, value); 
            });
        }
    };
});

eBay.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});

eBay.service('Random', function() {
	this.randomString = function(length) {
		var generatedString = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < length; i++ ) {
			generatedString += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return generatedString;
	};
});