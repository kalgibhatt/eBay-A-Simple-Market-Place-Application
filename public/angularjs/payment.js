var eBay = angular.module('eBay', [ 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.controller('homepage', function($scope, $http, $window, $location, $anchorScroll) {
	
	$scope.messages = [];
	$scope.success = [];
	
	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).then(function(result) {
			if (!angular.equals({}, result.data.userBO)) {
				$scope.user_fname = result.data.userBO.f_name;
				$scope.user_lname = result.data.userBO.l_name;
				$scope.user_name = result.data.userBO.user_name;
				$scope.user_id = result.data.userBO.user_id;
				$scope.fetchAddresses();
			} else {

			}
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchAddresses = function() {
		console.log($scope.user_id);
		$http({
			method	:	"POST",
			url 	:	"/fetchAddresses",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(result) {
			$scope.addresses = result.data.addresses;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchLoggedInUser();
	
	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).then(function(result) {
			$scope.notifications = result.data.notifications;
			$scope.notificationCount = result.data.notifications.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart = function() {
		$http({
			method : "POST",
			url : "/fetchCart"
		}).then(function(result) {
			$scope.cart_items = result.data.cart_items;
			$scope.cartItemCount = result.data.cart_items.length;
			$scope.cart_total = 0;
			for(var i = 0; i < $scope.cart_items.length; i++) {
				$scope.cart_total = $scope.cart_total + Number($scope.cart_items[i].sale_price) * Number($scope.cart_items[i].cart_qty);
			}
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchAddresses = function() {
		console.log($scope.user_id);
		$http({
			method	:	"POST",
			url 	:	"/fetchAddresses",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(result) {
			$scope.addresses = result.data.addresses;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.checkout = function() {
		$scope.messages = []; 
		var visaElectronCardRE = new RegExp("^(?:(?:2131|1800|35\d{3})\d{11})$");
		var americanExpressCardRE = new RegExp("^(?:3[47][0-9]{13})$");
		var dinersCardRE = new RegExp("^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$");
		var visaCardRE = new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?)$");
	    var masterCardRE = new RegExp("^(?:5[1-5][0-9]{14})$");
	    var discoverCardRE = new RegExp("^(?:6(?:011|5[0-9][0-9])[0-9]{12})$");
	    var cvvRegex = new RegExp("^[0-9]{3,4}$");
	    var expiryDateRegex = new RegExp("^(0[1-9]|1[0-2])\/?(20)?([0-9]{2})$");
	    var isValidCard = false;
	    var isValidExp = false;
	    var isValidCVV = false;
	    var isNotExpired = false;
	    if($scope.cardNumber !== undefined && $scope.expiryDate !== undefined && $scope.cvvNumber !== undefined && $scope.card_holder_fname !== undefined && $scope.card_holder_lname !== undefined) {
	    	var dateMatch = $scope.expiryDate.match(expiryDateRegex);
		    if($scope.cardNumber.match(visaElectronCardRE) === null && $scope.cardNumber.match(americanExpressCardRE) === null && $scope.cardNumber.match(dinersCardRE) === null && 
		    		$scope.cardNumber.match(visaCardRE) === null && $scope.cardNumber.match(masterCardRE) === null && $scope.cardNumber.match(discoverCardRE) === null) {
		    	$scope.messages.push("Not a valid Card Number!");
		    }
		    if(dateMatch === null) {
		    	$scope.messages.push("Not a valid Date Format!");
		    } else {
		    	var today = new Date();
		    	var expiryMonth = dateMatch[1];
		    	var expiryYear = dateMatch[3];
		    	if(today.getFullYear() > Number("20" + expiryYear)) {
		    		$scope.messages.push("Card is already expired!");
		    	} else if(today.getFullYear() === Number("20" + expiryYear)) {
		    		if(today.getMonth() + 1 > Number(expiryMonth)) {
		    			$scope.messages.push("Card is already expired!");
		    		}
		    	}
		    }
		    if($scope.cvvNumber.match(cvvRegex) === null) {
		    	$scope.messages.push("Not a valid CVV!");
		    }
			if($scope.messages.length === 0) {
				$http({
					method : "POST",
					url : "/checkout"
				}).then(function(result) {
					$scope.fetchCart();
					$scope.success.push("Congratulations! Checkout successful! Please see your account to see transaction details");
					$scope.cardNumber = "";
					$scope.cvvNumber = "";
					$scope.expiryDate = "";
					$scope.card_holder_fname = "";
					$scope.card_holder_lname = "";
				}, function(error) {
					// TODO: Handle Error
				});
			}
	    } else {
	    	$scope.messages.push("Please fill all the mendatory fields");
	    }
	};
	
	$scope.cancel = function() {
		$window.location.href = "/payment";
	};
	
	$scope.sellAnItem = function() {
		$window.location.href = "/sell";
	};
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};
	
	$scope.shop = function(item_id) {
		$window.location.href = "/viewItem?itemid=" + item_id;
	};
	
	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.user_name;
	};
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};

	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.showUser = function(eBay_handle) {
		$window.location.href = "/"+eBay_handle;
	};
	
	$scope.shop = function(item_id) {
		$window.location.href = "/viewItem?itemid=" + item_id;
	};
	
	$scope.gotoCart = function() {
		$window.location.href = "/cart";
	};
	
	$scope.show_notifications = false;
	
	$scope.hideNotifications = function() {
		$scope.show_notifications = false;
	};
	
	$scope.signout = function() {
		$http({
			method : "POST",
			url : "/signoutUser"
		}).then(function(result) {
			$window.location.href = "/?signout=true";
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart();
	$scope.fetchNotifications();
	
});