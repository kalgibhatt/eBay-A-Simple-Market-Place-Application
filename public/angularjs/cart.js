var eBay = angular.module('eBay', [ 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.controller('homepage', function($scope, $http, $window, $location, $anchorScroll) {
	
	$scope.messages = [];
	$scope.then = [];
	
	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).then(function(data) {
			if (!angular.equals({}, data.data.userBO)) {
				$scope.user_fname = data.data.userBO.f_name;
				$scope.user_lname = data.data.userBO.l_name;
				$scope.user_name = data.data.userBO.user_name;
				$scope.user_id = data.data.userBO.user_id;
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
		}).then(function(data) {
			$scope.addresses = data.data.addresses;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchLoggedInUser();
	
	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).then(function(data) {
			$scope.notifications = data.data.notifications;
			$scope.notificationCount = data.data.notifications.length;
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
		}).then(function(data) {
			$scope.addresses = data.data.addresses;
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
		}).then(function(data) {
			$scope.cart_items = data.data.cart_items;
			$scope.cartItemCount = data.data.cart_items.length;
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
		}).then(function(data) {
			$scope.fetchCart();
			$scope.then.push("Item successfully removed from your cart!");
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
		}).then(function(data) {
			$window.location.href = "/?signout=true";
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart();
	$scope.fetchNotifications();
	
	
	
});