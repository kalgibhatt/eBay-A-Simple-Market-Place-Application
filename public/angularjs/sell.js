var eBay = angular.module('eBay', ['ngAnimate', 'focus-if']);

eBay.controller('sell', function($scope, $http, $window) {
	
	$scope.isLoggedIn = false;
	$scope.messages = [];
	
	$http({
		method : "POST",
		url : "/loggedInUser"
	}).success(function(data) {
		if (angular.equals({}, data.userBO)) {
			$window.location.href = "/account?view=signin";
		} else {
			$scope.isLoggedIn = true;
		}
	}).error(function(error) {
		$window.location.href = "/";
	});
	
	$http({
		method	:	"POST",
		url		:	"/fetchConditions"
	}).success(function(data) {
		$scope.conditions = data.result;
	}).error(function(error) {
		$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
	});
	
	$http({
		method	:	"POST",
		url		:	"/fetchCategories"
	}).success(function(data) {
		$scope.categories = data.result;
	}).error(function(error) {
		$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
	});
	
	$scope.publish = function() {
		$scope.messages = [];
		if($scope.adv_title !== undefined && $scope.adv_title.trim() !== "" && 
				($scope.fixedPrice !== undefined && $scope.fixedPrice.trim() !== "" ||
				$scope.minBid !== undefined && $scope.minBid.trim() !== "") &&
				$scope.adv_qty !== undefined && $scope.adv_qty.trim() !== "" &&
				$scope.adv_desc !== undefined && $scope.adv_desc.trim() !== "") {
			console.log($scope.is_bid);
			$http({
				method	:	"POST",
				url		:	"/publishSale",
				data	:	{
					"advertise_title"		:	$scope.adv_title,
					"advertise_category"	:	$scope.adv_category,
					"advertise_condition"	:	$scope.item_condition,
					"advertise_is_bid"		:	$scope.is_bid,
					"advertise_price"		:	$scope.is_bid ? $scope.minBid : $scope.fixedPrice,
					"advertise_quantity"	:	$scope.adv_qty,
					"advertise_desc"		:	$scope.adv_desc
				}
			}).success(function(data) {
				if(data.status_code === 200) {
						$scope.adv_title = "";
						$scope.adv_category = "";
						$scope.item_condition = "";
						$scope.is_bid = false;
						$scope.minBid = "";
						$scope.fixedPrice = ""
						$scope.adv_qty = "";
						$scope.adv_desc = "";
						$scope.showMore = false;
						$scope.messages.push("Sale published successfully!");
					} else {
					$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
					$scope.showMore = false;
				}
			}).error(function(error) {
				$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
			});
		} else {
			$scope.messages.push("Please fill all the sale details to publish it!");
		}
	};
	
	$scope.sell = function() {
		$scope.messages = [];
		if($scope.adv_title !== undefined && $scope.adv_title.trim() !== "") {
			$scope.showMore = true;
		} else {
			$scope.messages.push("Please add title to start selling!");
		}
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