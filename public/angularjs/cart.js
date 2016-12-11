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
		$window.location.href = "/payment";
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
	
	$scope.remove = function(item_id) {
		$http({
			method	:	"POST",
			url		:	"/removeFromCart",
			data	:	{
				"item"	:	item_id
			}
		}).then(function(result) {
			$scope.fetchCart();
			$scope.success.push("Item successfully removed from your cart!");
		}, function(error) {
			// TODO: Handle Error
		});
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
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};

	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.user_name;
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