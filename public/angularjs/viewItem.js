var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

//	TODO: Prevent showing anything until the whole DOM is loaded.

eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('viewItem', function($scope, $http, $location, $window, $interval, Util) {
	
	$scope.cart_qty = 0;
	
	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).success(function(data) {
			$scope.notifications = data.notifications;
			$scope.notificationCount = data.notifications.length;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart = function() {
		$http({
			method : "POST",
			url : "/fetchCart"
		}).success(function(data) {
			$scope.cart_items = data.cart_items;
			$scope.cartItemCount = data.cart_items.length;
			$scope.cart_total = 0;
			for(var i = 0; i < $scope.cart_items.length; i++) {
				$scope.cart_total = $scope.cart_total + Number($scope.cart_items[i].sale_price) * Number($scope.cart_items[i].cart_qty);
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchBidDetails = function() {
		$http({
			method	:	"POST",
			url		:	"/fetchBidDetails",
			data	:	{
				"itemid"	:	$scope.item_id
			}
		}).success(function(data) {
			$scope.bid_details = data.results;
			$scope.number_of_bids = data.results.length;
			$scope.futureTime = new Date(data.futureTime);
			$scope.bid_price = Number($scope.current_price) + 1;
		}).error(function(err) {
			
		});
	};
	
	
	$scope.fetchItemDetails = function() {
		$http({
			method	:	"POST",
			url		:	"/fetchItemDetails",
			data	:	{
				"itemid"	:	$location.search().itemid
			}
		}).success(function(data) {
			$scope.item_id = data.item_id;
			if($scope.item_id !== -1) {
				$scope.item_title = data.item_title;
				$scope.item_description = data.item_description.replace(/\n/g, '<br/>');
				$scope.item_condition = data.item_condition;
				$scope.available_quantity = data.available_quantity;
				$scope.is_bid = Number(data.is_bid) === 1 ? true : false;
				$scope.current_price = data.current_price;
				$scope.item_seller_fname = data.item_seller_fname;
				$scope.item_seller_lname = data.item_seller_lname;
				$scope.item_seller_handle = data.item_seller_handle;
				$scope.item_seller_id = data.item_seller_id;
				$window.document.title = $scope.item_title + " | eBay";
				if($scope.is_bid) {
					$scope.fetchBidDetails();
				}
			} else {
				$window.location.href = "/";
			}
		}).error(function(err) {
			
		});
	};
	
	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};
	
	$scope.bid = function() {
		$http({
			method	:	"POST",
			url		:	"/placeBid",
			data	:	{
				"bid_item"	:	$scope.item_id,
				"bid_price"	:	$scope.bid_price,
				"bid_qty"	:	$scope.cart_qty
			}
		}).success(function(data) {
			if(data.status_code === 200) {
				$scope.message = "Bid Placed successfully!";
				$scope.fetchBidDetails();
				$scope.fetchItemDetails();
				$scope.success = true;
			} else if(data.status_code === 301){
				$window.location.href = "/account?view=signin";
			}
		}).error(function(err) {
			
		});
	};
	
	$scope.fetchItemDetails();
	
	$scope.buyAndCheckout = function() {
		$scope.addToCart();
		$window.location.href = "/payment";
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
		$http({
			method	:	"POST",
			url		:	"/addToCart",
			data	:	{
				"itemid"	:	$location.search().itemid,
				"qty"		:	$scope.cart_qty
			}
		}).success(function(data) {
			if(data.status_code === 200) {
				$scope.fetchCart();
				$scope.message = "Congratulations! " + $scope.item_title + " Added to your Cart!";
				$scope.success = true;
			} else if(data.status_code === 500) {
				$scope.message = "Internal error! Please try again.";
				$scope.success = true;
			} else if(data.status_code === 301) {
				$window.location.href = "/account?view=signin&redir=viewItem-itemid-" + $scope.item_id;
			}
		}).error(function(err) {
			
		});
	};
	
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
		$window.location.href = "/"+$scope.user_name;
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
		$scope.fetchBidDetails();
		$scope.show_bid_details = true;
	};
	
	$scope.fetchCart();
	$scope.fetchNotifications();
	
	$http({
		method : "POST",
		url : "/loggedInUser"
	}).success(function(data) {
		if (!angular.equals({}, data.userBO)) {
			$scope.user_fname = data.userBO.f_name;
			$scope.user_lname = data.userBO.l_name;
			$scope.user_name = data.userBO.user_name;
		} else {

		}
	}).error(function(error) {
		// TODO: Handle Error
	});
	
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
		link: function($scope, element, attrs) {
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