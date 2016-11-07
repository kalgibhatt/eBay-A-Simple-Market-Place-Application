var eBay = angular.module('eBay', [ 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.controller('homepage', function($scope, $http, $window, $location, $anchorScroll) {
	
	$scope.messages = [];
	$scope.success = [];
	$scope.outer_messages = [];
	
	$scope.fetchLoggedInUser = function(callback) {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).success(function(data) {
			$scope.loggedInUser = data.loggedInUser;
			callback();
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchLoggedInUser(function() {
		$scope.cart_total = 0;
		for(var i = 0; i < $scope.loggedInUser.cart.length; i++) {
			$scope.cart_total = Number($scope.cart_total) + Number($scope.loggedInUser.cart[i].sale_price);
		}
	});
	
	$scope.checkout = function() {
		$window.location.href = "/payment";
	};
	
	$scope.remove = function(item_id) {
		$http({
			method	:	"POST",
			url		:	"/removeFromCart",
			data	:	{
				"item"	:	item_id
			}
		}).success(function(data) {
			$scope.fetchLoggedInUser(function() {
				$scope.cart_total = 0;
				for(var i = 0; i < $scope.loggedInUser.cart.length; i++) {
					$scope.cart_total = Number($scope.cart_total) + Number($scope.loggedInUser.cart[i].sale_price);
				}
			});
			$scope.success.push("Item successfully removed from your cart!");
		}).error(function(error) {
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
		if($scope.searchString !== undefined && $scope.searchString.trim() !== "") {
			$window.location.href = "/?query=" + $scope.searchString;
		} else {
			$scope.outer_messages.push("Please enter an item name or seller name to search!");
		}
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.loggedInUser.username;
	};
	
	$scope.showUser = function(eBay_handle) {
		$window.location.href = "/"+eBay_handle;
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
		}).success(function(data) {
			$window.location.href = "/?signout=true";
		}).error(function(error) {
			// TODO: Handle Error
		});
	};

});