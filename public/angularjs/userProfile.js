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
		}).then(function(result) {
			$scope.sold_items = result.data.soldItems;
			$scope.sold_count = $scope.sold_items.length;
		}, function(error) {
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
		}).then(function(result) {
			$scope.bought_items = result.data.boughtItems;
			$scope.bought_count = $scope.bought_items.length;
		}, function(error) {
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
		}).then(function(result) {
			$scope.sale_items = result.data.saleItems;
			$scope.sale_count = $scope.sale_items.length;
		}, function(error) {
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
		}).then(function(result) {
			$scope.contact = result.data.contact;
			$scope.edit_contact = false;
		}, function(error) {
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
		}).then(function(result) {
			$scope.dob = new Date(result.data.dob);
			$scope.edit_dob = false;
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
	
	$scope.remove = function(location_id) {
		$http({
			method	:	"POST",
			url		:	"/removeAddress",
			data	:	{
				"location_id"	:	location_id
			}
		}).then(function(result) {
			$scope.fetchAddresses();
			$scope.success.push("Address successfully removed from your profile!");
		}, function(error) {
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
		}).then(function(result) {
			if(result.data.status_code === 200) {
				$scope.fetchAddresses();
				$scope.add_address = false;
			}
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
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
		}).then(function(result) {
			$window.location.href = "/?signout=true";
		}, function(error) {
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
		}).then(function(result) {
			$scope.user_id = result.data.user_id;
			$scope.fname = result.data.fname;
			$scope.lname = result.data.lname;
			$scope.profile_name = result.data.user_name;
			$scope.contact = result.data.contact;
			$scope.dob = new Date(result.data.dob);
			$window.document.title = $scope.profile_name + " on eBay";
			$scope.fetchAddresses();
			$scope.fetchCart();
			$scope.fetchNotifications();
			$scope.fetchSold();
			$scope.fetchBought();
			$scope.fetchSale();
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchUserProfile();
	
	$http({
		method : "POST",
		url : "/loggedInUser"
	}).then(function(result) {
		if (!angular.equals({}, result.data.userBO)) {
			$scope.user_fname = result.data.userBO.f_name;
			$scope.user_lname = result.data.userBO.l_name;
			$scope.user_name = result.data.userBO.user_name;
		} else {

		}
	}, function(error) {
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