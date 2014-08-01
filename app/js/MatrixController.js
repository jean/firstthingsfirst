/*
 * TODO:
 * Sort items: http://jsfiddle.net/xnnjQ/6/
 *
 *
 */
angular.module('myApp.controllers').controller('MatrixController', ['$scope', 'AuthService', function($scope, AuthService) {

	// Register this controller on AuthService.authorized
	$scope.$on('authorized', function(e, args) {
		// Start retrieving data
	});

	$scope.user = {
		name: '-',
		authenticated: false,
	};

	$scope.status = {
		msg: '',
	}

	$scope.cards = [];

	$scope.settings = {
		labels: ['green','yellow','orange','red','purple','blue'],
		selectedLabel: "red",
		urgentDate: new Date(),
		selectedBoard: "allAssigned",
		boards: [
	        { id: "allAssigned", name: "All cards assigned to me", },
	        { id: "allVisible", name: "All cards visible to me", },
		    { id: "abc", name: "ABC", },
		    { id: "def", name: "DEF", },
		    { id: "geh", name: "GEH", },
        ],
	};

  	$scope.init = function() {

  	}

	var self = this;

	$scope.onAuthorize = function() {
	    Trello.members.get("me", function(member) {
	    	$scope.$apply(function() {
	    		$scope.user.authenticated = true;
	    		$scope.user.name = member.fullName;

	    		$scope.status.msg = "Loading cards...";
	    	});

	        // Output a list of all of the cards that the member
	        // is assigned to
	        Trello.get("members/me/cards", function(cards) {
	        	$scope.$apply(function(){
	            	$scope.cards = [];
	            	angular.forEach(cards, function(card) {
	                	$scope.cards.push(card);
	            	});
	        		$scope.status.msg = "Cards loaded.";
	            });

	        	$("li.card").draggable({
	        		appendTo: 'body',
	        		containment: 'window',
	        		helper: 'clone',
	        		revert: true,
	        		stack: "li.card",
	        		start: function(){
	        			$(this).hide();
	        		},
	        		stop: function(){
	        			$(this).show();
	        		}
				});
	        });
	    });
	};

	$scope.cardIsImportant = function(item) {
		return (item.labels.length > 0)
			&& item.labels.some(function(i) { return i == $scope.settings.selectedLabel });
	};

	$scope.cardIsUrgent = function(item) {
		return (item.due != null)
			&& item.due > $scope.settings.urgentDate;
	};

	$scope.urgentAndImportantFilter = function(item) {
		return $scope.cardIsUrgent(item) && $scope.cardIsImportant(item);
	};

	$scope.importantFilter = function(item) {
		return $scope.cardIsImportant(item) && !$scope.cardIsUrgent(item);
	};

	$scope.urgentFilter = function(item) {
		return $scope.cardIsUrgent(item) && !$scope.cardIsImportant(item);
	};

	$scope.notUrgentNorImportantFilter = function(item) {
		return !$scope.cardIsUrgent(item) && !$scope.cardIsImportant(item);
	};

	$scope.replaceCard = function(newCard) {
		var oldCards = $scope.cards;
		$scope.cards = [];
		$scope.cards.push(newCard);
		angular.forEach(oldCards, function(card) {
			if (newCard.id != card.id) {
				$scope.cards.push(card);
			}
		});
	};

	/**
	 * add new card (from frontend).
	 */
	$scope.addCard = function() {
		var newCard = {
			name: "New card...",
			done: false,
			url: "http://trello.com/abcd",
			due: new Date(),
			labels: ["red"],
		};

		$scope.cards.push(newCard);
	};

	/*
	 * Application startup code / jQuery handling of elements
	 * TODO: move somewhere else
	 */

	/*
	 * commented out for offline development
	 * TODO: modularize and make fault tolerant
	Trello.authorize({
	    interactive:false,
	    success: $scope.onAuthorize,
	    scope: { write: true, read: true }
	});
	*/

	$("#trelloLogout").click(function() {
		Trello.deauthorize();
		$scope.onDeauthorize();
	});

	/*
	$("#urgent-important").droppable({
		accept: ".card",
		activeClass: "drop-active",
		hoverClass: "drop-hover",
		drop: function(event, ui) {
			var item = angular.element(ui.draggable.context).scope().item;
			if (item) {
				$scope.$apply(function() {
					if (!self.cardIsUrgent(item)) {
						item.due = new Date();
					}

					if (!self.cardIsImportant(item)) {
						item.labels.push("red");
					}
				});

	        	$("li.card").draggable({
	        		containment: "document",
	        		revert: true,
	        		stack: "li.card",
				});
			}
		},
		tolerance: 'pointer',
	});

	$("#important").droppable({
		accept: ".card",
		activeClass: "drop-active",
		hoverClass: "drop-hover",
		drop: function(event, ui) {
			var card = angular.element(ui.draggable.context).scope().card;
			if (card) {
				if (self.cardIsUrgent(card)) {
					Trello.put(
						"cards/" + card.id + "/due",
						{ value: null, },
						function(newCard) {
							$scope.$apply(function() {
								$scope.replaceCard(newCard);
							});
						}
					);
				}

				if (!self.cardIsImportant(card)) {
					// TODO add label
				}
			}
		},
		tolerance: 'pointer',
	});

	$("#urgent").droppable({
		accept: ".card",
		activeClass: "drop-active",
		hoverClass: "drop-hover",
		drop: function(event, ui) {
			var card = angular.element(ui.draggable.context).scope().card;
			if (card) {
				if (!self.cardIsUrgent(card)) {
					Trello.put(
						"cards/" + card.id + "/due",
						{ value: (new Date()).toJSON(), },
						function(newCard) {
							$scope.$apply(function() {
								$scope.replaceCard(newCard);
							});
						}
					);
				}

				if (self.cardIsImportant(card)) {
					// TODO remove label (or ask user whether to remove the label)
				}
			}
		},
		tolerance: 'pointer',
	});

	$("#not-urgent-not-important").droppable({
		accept: ".card",
		activeClass: "drop-active",
		hoverClass: "drop-hover",
		drop: function(event, ui) {
			var item = angular.element(ui.draggable.context).scope().item;
			if (item) {
				$scope.$apply(function() {
					item.due = null;
					item.labels = [];
				});

	        	$("li.card").draggable({
	        		containment: "document",
	        		revert: true,
	        		stack: "li.card",
				});
			}
		},
		tolerance: 'pointer',
	});
	*/
}]);