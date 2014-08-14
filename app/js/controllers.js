'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('HomeController', ['$scope', 'AuthService', function($scope, AuthService) {

	$scope.userAuthorized = false;

	/**
	 * Initialize controller after loading
	 */
	$scope.init = function() {
		/* Load data if user is already authorized */
		if (AuthService.user.authorized) {
			$scope.userAuthorized = true;
		}

		// Register this controller on AuthService.authorized
		$scope.$on('authorized', function(e, args) {
			$scope.userAuthorized = true;
		});

		$scope.$on('deauthorized', function(e, args) {
			$scope.userAuthorized = false;
		});
	};

	/**
	 * Additional login action
	 */
	$scope.login = function() {
		AuthService.authorize();
	};

	$scope.init();

}])
.controller('AboutController', ['$scope', function($scope) {

}])
.controller('NavbarController', ['$scope', 'AuthService', function($scope, AuthService) {

	// Initialize with current status
	$scope.authorized = AuthService.user.authorized;

	$scope.$on('authorized', function(e, args) {
		$scope.authorized = true;
	});

	$scope.$on('deauthorized', function(e, args) {
		$scope.authorized = false;
	});

	$scope.login = function() {
		AuthService.authorize();
	};

	$scope.logout = function() {
		AuthService.deauthorize();
	};
}])
;
