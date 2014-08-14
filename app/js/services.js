'use strict';

/* Services */

angular.module('myApp.services', [])
	// Simple value service from example
	.value('version', '0.2')
	// AuthService
	.factory('AuthService', ['$rootScope', function($rootScope) {

		// Trello authorization service

		// Workaround trello authorization issue by initially trying
		// to authorize without interaction.
		var preAuthorized = false;
		Trello.authorize({
			interactive: false,
			success: function() {
				preAuthorized = true;
			},
			scope: { write: true, read: true },
		});

		var service = {
			user: {
				name: '',
				authorized: preAuthorized,
			},

			onAuthorized: function() {
				$rootScope.$broadcast('authorized');
			},

			onDeauthorized: function() {
				$rootScope.$broadcast('deauthorized');
			},
		};

		var workaroundApplyIssueFirstCall = true;

		service.authorize = function() {
		    Trello.authorize({
		    	type: 'popup',
		        name: 'First things first',
		        scope: { write: true, read: true },
		        success: function() {
		        	if (workaroundApplyIssueFirstCall) {
		        		workaroundApplyIssueFirstCall = false;
			        	$rootScope.$apply(function() {
			        		service.user.authorized = true;
		        			service.onAuthorized();
			        	});
		        	} else {
		        		// Call without $apply() - still does not work sometimes apply would be needed
		        		service.user.authorized = true;
	        			service.onAuthorized();
		        	}
	        	},
		    	error: function() { /* TODO */ },
		    });
		};

		service.deauthorize = function() {
			Trello.deauthorize();
			service.user.authorized = Trello.authorized();
			service.onDeauthorized();
		};

		// TODO: Load user information
	    // Trello.members.get("me", function(member) {
	    // 	$scope.$apply(function() {
	    // 		$scope.user.authenticated = true;
	    // 		$scope.user.name = member.fullName;

	    // 		$scope.status.msg = "Loading cards...";
	    // 	});

	    // });

		return service;
	}])
;
