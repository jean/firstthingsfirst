'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
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
