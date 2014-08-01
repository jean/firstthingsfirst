'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
	.value('version', '0.1')
	.factory('AuthService', function() {
		var authServiceInstance = {
			user: {
				name: '',
				authenticated: false,
				test: '--test--',
			},
		};

		return authServiceInstance;
	})
	// .service('AuthService', function() {
	// 	this.user = {
	// 		name: '',
	// 		authenticated: false,
	// 		test: '--test--',
	// 	};
	// })
;
