'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
	.controller('AboutController', ['$scope', function($scope) {

	}])
	.controller('NavbarController', ['$scope', 'AuthService', function($scope, AuthService) {
		$scope.xxx = AuthService.user.test;
	}])
;
