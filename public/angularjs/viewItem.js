
var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

//	TODO: Prevent showing anything until the whole DOM is loaded.

eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('viewItem', function($scope, $http, $location, $window, $interval, Util) {

	$scope.fetchItemDetails = function() {
		$http({
			method	:	"POST",
			url		:	"/fetchItemDetails",
			data	:	{
				"itemid"	:	$location.search().itemid
			}
		}).success(function(data) {
			if(!angular.equals({}, data.item)) {
				$scope.item = data.item;
				console.log("$scope.item ", $scope.item);
				$scope.futureTime = new Date(data.futureTime);
			} else {
				$window.location.href = "/";
			}
		}).error(function(err) {
			
		});
	};

	$scope.fetchItemDetails();

	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};

	$scope.bid = function() {
		$http({
			method	:	"POST",
			url		:	"/placeBid",
			data	:	{
				"bid_item"	:	$scope.item._id,
				"bid_price"	:	$scope.bid_price,
				"bid_qty"	:	$scope.cart_qty
			}
		}).success(function(data) {
			if(data.status_code === 200) {
				$scope.message = "Bid Placed successfully!";
				$scope.fetchItemDetails();
				$scope.success = true;
			} else if(data.status_code === 301){
				$window.location.href = "/account?view=signin";
			}
		}).error(function(err) {
			
		});
	};
	
	$scope.buyAndCheckout = function() {
		$scope.addToCart();
		$window.location.href = "/cart";
	};
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};

	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.sellAnItem = function() {
		$window.location.href = "/sell";
	};
	
	$scope.showUser = function(eBay_handle) {
		$window.location.href = "/"+eBay_handle;
	};

	$scope.addToCart  = function() {
		if($scope.cart_qty > 0) {
			$http({
				method	:	"POST",
				url		:	"/addToCart",
				data	:	{
					"item"	:	$scope.item,
					"qty"		:	$scope.cart_qty
				}
			}).success(function(data) {
				if(data.status_code === 200) {
					$scope.fetchItemDetails();
					$scope.fetchLoggedInUser();
					$scope.message = "Congratulations! " + $scope.item.title + " added to your Cart!";
					$scope.success = true;
				} else if(data.status_code === 500) {
					$scope.message = "Internal error! Please try again.";
					$scope.success = true;
				} else if(data.status_code === 301) {
					$window.location.href = "/account?view=signin&redir=viewItem-itemid-" + $scope.item._id;
				}
			}).error(function(err) {
				
			});
		} else {
			$scope.message = "Please add some non-zero quantity to cart!";
			$scope.success = false;
		}
	};

	$scope.fetchAllTransactions = function() {
		$http({
			method	:	"POST",
			url		:	"/fetchTransactions",
			data	:	{
				"itemid"	:	$location.search().itemid
			}
		}).success(function(data) {
			$scope.total_sold = data.total_sold === null ? 0 : data.total_sold;
		}).error(function(err) {
			
		});
	}

	$scope.fetchAllTransactions();

	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};
	
	$scope.gotoCart = function() {
		$window.location.href = "/cart";
	};
	
	$scope.show_notifications = false;
	
	$scope.hideNotifications = function() {
		$scope.show_notifications = false;
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.loggedInUser.username;
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
	
	$interval(function() {
		var diff = Math.floor(($scope.futureTime.getTime() - new Date().getTime()) / 1000);
		$scope.countdownTime = Util.dhms(diff);
	}, 1000);
	
	$scope.openBids = function() {
		$scope.show_bid_details = true;
	};
	
	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).success(function(data) {
			$scope.loggedInUser = data.loggedInUser;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchLoggedInUser();
	
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

eBay.directive('ngCountdown', ['Util', '$interval', function(Util, $interval) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var future;
			future = new Date(scope.date);
			$interval(function() {
				var diff;
				diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
				return element.text(Util.dhms(diff));
			}, 1000);
		}
	};
}]);

eBay.factory('Util', [function() {
	return {
		dhms	:	function(t) {
			var days, hours, minutes, seconds;
			days = Math.floor(t / 86400);
			t -= days * 86400;
			hours = Math.floor(t / 3600) % 24;
			t -= hours * 3600;
			minutes = Math.floor(t / 60) % 60;
			t -= minutes * 60;
			seconds = t % 60;
			return [days + 'd', hours + 'h', minutes + 'm', seconds + 's'].join(' ');
		}
	};
}]);