var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.config([ '$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled : true,
		requireBase : false
	});
} ]);

eBay.controller('userProfile', function($scope, $http, $location, $window) {
	
	$scope.fetchSold = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchSoldByUser",
			data	:	{
				"user"		:	$scope.user_profile._id
			}
		}).success(function(data) {
			$scope.sold_items = data.soldItems;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchBought = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchBoughtByUser",
			data	:	{
				"user"		:	$scope.user_profile._id
			}
		}).success(function(data) {
			$scope.bought_items = data.boughtItems;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchSale = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchSaleByUser",
			data	:	{
				"user"		:	$scope.user_profile._id
			}
		}).success(function(data) {
			$scope.sale_items = data.saleItems;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.updateContact = function() {
		$http({
			method	:	"POST",
			url 	:	"/updateContact",
			data	:	{
				"contact"	:	$scope.user_profile.contact,
				"user"		:	$scope.user_profile._id
			}
		}).success(function(data) {
			$scope.user_profile.contact = data.contact;
			$scope.edit_contact = false;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.updateDOB = function() {
		var dob = new Date($scope.user_profile.dob);
		$http({
			method	:	"POST",
			url 	:	"/updateDOB",
			data	:	{
				"dob"		:	dob.getFullYear() + "-" + (Number(dob.getMonth()) + 1) + "-" + dob.getDate(),
				"user"		:	$scope.user_profile._id
			}
		}).success(function(data) {
			$scope.user_profile.dob = new Date(data.dob);
			$scope.edit_dob = false;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.addAddress = function() {
		$scope.messages = [];
		if($scope.street_address !== undefined && $scope.street_address.trim() !== "" &&
				$scope.city !== undefined && $scope.city.trim() !== "" && 
				$scope.state !== undefined && $scope.state.trim() !== "" &&
				$scope.country !== undefined && $scope.country.trim() !== "" &&
				$scope.zip_code !== undefined && $scope.zip_code.trim() !== "") {
			$http({
				method	:	"POST",
				url 	:	"/addAddress",
				data	:	{
					"st_address"	:	$scope.street_address,
					"apt"			:	$scope.apartment,
					"city"			:	$scope.city,
					"state"			:	$scope.state,
					"country"		:	$scope.country,
					"zip"			:	$scope.zip_code,
					"user_id"		:	$scope.user_id
				}
			}).success(function(data) {
				if(data.status_code === 200) {
					$scope.fetchLoggedInUser();
					$scope.add_address = false;
				}
			}).error(function(error) {
				// TODO: Handle Error
			});
		} else {
			$scope.messages.push("Please add all mendatory values of address!");
		}
	};
	
	$scope.updatePrice = function(sale_item) {
		sale_item.edit_price = false;
	};
	
	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
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
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.loggedInUser.username;
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
	
	$scope.fetchUserProfile = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchUserProfile",
			data	:	{
				"username"	:	$location.path().substring(1)
			}	
		}).success(function(data) {
			$scope.user_profile = data.user_profile;
			$window.document.title = $scope.user_profile.f_name + " " + $scope.user_profile.l_name + " | eBay";
			$scope.fetchSold();
			$scope.fetchBought();
			$scope.fetchSale();
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchUserProfile();
	
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