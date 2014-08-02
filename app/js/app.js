'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/matrix', {templateUrl: 'partials/matrix.html', controller: 'MatrixController'});
  $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutController'});
  $routeProvider.otherwise({redirectTo: '/matrix'});
}]);
