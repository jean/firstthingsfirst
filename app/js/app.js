'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap',
  'angularMoment',
  'ngDraggable',
  'angulartics',
  'angulartics.google.analytics'
])
/**
 * Route configuration
 */
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/home', {templateUrl: 'partials/home.html', controller: 'HomeController'})
  .when('/matrix', {templateUrl: 'partials/matrix.html', controller: 'MatrixController'})
  .when('/about', {templateUrl: 'partials/about.html', controller: 'AboutController'})
  .otherwise({redirectTo: '/home'});
}])
/**
 * Default configuration, overwritten in optional configuration file config.js (excluded from version control)
 */
.constant('appConfiguration', {
  tracking: false,
  gaTrackingId: null,
  trelloApiKey: null,
})
// .constant('angularMomentConfig', {
//     preprocess: 'unix', // optional
//     timezone: 'Europe/London' // optional
// })
;
