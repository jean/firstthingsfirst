'use strict';

/**
 * Example configuration file - should be copied to config.js file on server.
 */

angular.module('myApp')
.config(['appConfiguration', function(appConfiguration) {
	appConfiguration.tracking = true;
	appConfiguration.gaTrackingId = 'UA-12345678-9';
	appConfiguration.trelloApiKey = '1234567890';
}])
.run(['appConfiguration', function(appConfiguration) {
	if (appConfiguration.tracking) {
		ga('create', appConfiguration.gaTrackingId, 'auto');
	}
}])
;
