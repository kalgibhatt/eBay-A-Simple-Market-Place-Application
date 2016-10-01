var calculator = angular.module('calculator', []);
calculator.controller('calculate', function($scope, $http) {
	
	$scope.calculate = function() {
		var inputRegex = new RegExp("^(-{0,1}[0-9.]+)([+-×÷]{1})(-{0,1}[0-9.]+)$");
		var matches = $scope.result.match(inputRegex);
		console.log(matches);
		var val1 = matches[1];
		var val2 = matches[3];
		var operator = matches[2];
		$http({
			method : "POST",
			url : '/calculate',
			data : {
				"val1" : val1,
				"val2" : val2,
				"operator" : operator
			}
		}).success(function(data) {
			$scope.result = data.result;
		});
	};
	
	$scope.resetDisplay = function() {
		$scope.result = "";
	};
	
	$scope.display = function(button) {
		if($scope.result === undefined) {
			$scope.result = "";
		}
		var newValue = String($scope.result) + button;
		if(new RegExp("^(-{0,1}[0-9.]+)([+-×÷]{0,1})(-{0,1}[0-9.]*)$").test(newValue)) {
			$scope.result = String($scope.result) + button;
		}
	};
})
.directive('inputPattern', [function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var ele = element[0];
			var pattern = new RegExp(attrs.inputPattern);
			var value = ele.value;
			
			ele.addEventListener('keyup',function(e) {
				if(pattern.test(ele.value)) {
					value = ele.value;
				} else {
					ele.value = value;
				}
			});
		}
	};
}]);
