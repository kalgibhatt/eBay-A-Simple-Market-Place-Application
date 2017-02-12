var eBay = angular.module('eBay', ['ngAnimate', 'focus-if']);

eBay.controller('sell', function($scope, $http, $window) {
	
	$scope.isLoggedIn = false;
	
	$http({
		method : "POST",
		url : "/loggedInUser"
	}).then(function(data) {
		if (angular.equals({}, data.data.userBO)) {
			$window.location.href = "/account?view=signin";
		} else {
			$scope.isLoggedIn = true;
		}
	}, function(error) {
		// TODO: Handle Error
	});
	
	$scope.message = "";
	
	$http({
		method	:	"POST",
		url		:	"/fetchConditions"
	}).then(function(data) {
		$scope.conditions = data.data.result;
	}, function(error) {
		
	});
	
	$http({
		method	:	"POST",
		url		:	"/fetchItems"
	}).then(function(data) {
		$scope.items = data.data.result;
	}, function(error) {
		
	});
	
	$scope.publish = function() {
		$scope.message = "";
		$http({
			method	:	"POST",
			url		:	"/publishSale",
			data	:	{
				"advertise_title"		:	$scope.adv_title,
				"advertise_item"		:	$scope.adv_item.item_id,
				"advertise_condition"	:	$scope.item_condition,
				"advertise_is_bid"		:	$scope.is_bid,
				"advertise_price"		:	$scope.is_bid ? $scope.minBid : $scope.fixedPrice,
				"advertise_quantity"	:	$scope.adv_qty,
				"advertise_desc"		:	$scope.adv_desc
			}
		}).then(function(data) {
			if(data.data.status_code === "200") {
					$scope.adv_title = "";
					$scope.adv_item.item_id = "";
					$scope.item_condition = "";
					$scope.is_bid = false;
					$scope.minBid = "";
					$scope.fixedPrice = ""
					$scope.adv_qty = "";
					$scope.adv_desc = "";
					$scope.showMore = false;
					$scope.message = "Sale published successfully!";
				} else {
				$scope.message = "Internal Error. Please try again!";
				$scope.showMore = false;
			}
		}, function(error) {
			
		});
	};
	
	$scope.sell = function() {
		$scope.showMore = true;
	};
	
	$scope.isBid = function() {
		$scope.is_bid = true;
		$scope.fixedPrice = "";
	};
	
	$scope.notBid = function() {
		$scope.is_bid = false;
		$scope.minBid = "";
	};
	
	$scope.homepage = function() {
		if($scope.showMore) {
			$scope.showMore = false;
		} else {
			$window.location.href = "/";
		}
	};
	
	$scope.straightHomepage = function() {
		$window.location.href = "/";
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