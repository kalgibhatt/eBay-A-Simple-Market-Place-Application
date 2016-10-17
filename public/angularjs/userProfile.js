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
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.sold_items = data.soldItems;
			$scope.sold_count = $scope.sold_items.length;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchBought = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchBoughtByUser",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.bought_items = data.boughtItems;
			$scope.bought_count = $scope.bought_items.length;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchSale = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchSaleByUser",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.sale_items = data.saleItems;
			$scope.sale_count = $scope.sale_items.length;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.updateContact = function() {
		$http({
			method	:	"POST",
			url 	:	"/updateContact",
			data	:	{
				"contact"	:	$scope.contact,
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.contact = data.contact;
			$scope.edit_contact = false;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.updateDOB = function() {
		var dob = new Date($scope.dob);
		$http({
			method	:	"POST",
			url 	:	"/updateDOB",
			data	:	{
				"dob"		:	dob.getFullYear() + "-" + (Number(dob.getMonth()) + 1) + "-" + dob.getDate(),
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.dob = new Date(data.dob);
			$scope.edit_dob = false;
		}).error(function(error) {
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
		}).success(function(data) {
			$scope.addresses = data.addresses;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.remove = function(location_id) {
		$http({
			method	:	"POST",
			url		:	"/removeAddress",
			data	:	{
				"location_id"	:	location_id
			}
		}).success(function(data) {
			$scope.fetchAddresses();
			$scope.success.push("Address successfully removed from your profile!");
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.addAddress = function() {
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
				$scope.fetchAddresses();
				$scope.add_address = false;
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
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
		$window.location.href = "/"+$scope.user_name;
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
			$scope.user_id = data.user_id;
			$scope.fname = data.fname;
			$scope.lname = data.lname;
			$scope.profile_name = data.user_name;
			$scope.contact = data.contact;
			$scope.dob = new Date(data.dob);
			$window.document.title = $scope.profile_name + " on eBay";
			$scope.fetchAddresses();
			$scope.fetchCart();
			$scope.fetchNotifications();
			$scope.fetchSold();
			$scope.fetchBought();
			$scope.fetchSale();
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchUserProfile();
	
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