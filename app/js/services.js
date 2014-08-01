'use strict';

/* Services */

angular.module('myApp.services', [])
	// Simple value service from example
	.value('version', '0.1')
	// AuthService
	.factory('AuthService', ['$rootScope', function($rootScope) {

		// Trello authorization service

		var service = {
			user: {
				name: '',
				authorized: Trello.authorized,
			},

			onAuthorized: function() {
				$rootScope.$broadcast('authorized');
			},

			onDeauthorized: function() {
				$rootScope.$broadcast('deauthorized');
			},
		};

		service.authorize = function() {
		    Trello.authorize({
		        type: "popup",
		        success: function() {
		        	$rootScope.$broadcast('authorized');
	        	},
		    	error: function() { /* TODO */ },
		        scope: { write: true, read: true },
		        name: "First things first",
		    })
		};

		service.deauthorize = function() {
			Trello.deauthorize();
			$rootScope.$broadcast('deauthorized');
		};

		return service;
	}])
;
