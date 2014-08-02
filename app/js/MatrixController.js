/*
 * TODO:
 * Sort items: http://jsfiddle.net/xnnjQ/6/
 *
 *
 */
angular.module('myApp.controllers').controller('MatrixController', ['$scope', '$log', '$filter', 'AuthService', function($scope, $log, $filter, AuthService) {

	/* Setting default values */
	$scope.datepickerOpened = false;
	$scope.dropdownBoardOpened = false;
	$scope.dropdownLabelOpened = false;

	$scope.cards = [];

	$scope.boards = [];
	$scope.selectedBoard = null;

	$scope.labelNames = ['green','yellow','orange','red','purple','blue'];
	$scope.selectedLabel = "red";
	$scope.selectedLabelClass = 'label-red';

	$scope.selectedUrgentDate = moment().subtract('days', 7).toDate();

	$scope.settings = {
        dateFormat: 'yyyy-MM-dd',
        dateOptions: {
			formatYear: 'yy',
			startingDay: 1,
		},
	};

	/**
	 * Initialize controller after loading
	 */
	$scope.init = function() {
		/* Load data if user is already authorized */
		if (AuthService.user.authorized) {
			$scope.loadUserData();
			$scope.loadCards();
		}

		// Register this controller on AuthService.authorized
		$scope.$on('authorized', function(e, args) {
			$scope.loadUserData();
			$scope.loadCards();
		});
	};

	/**
	 * Load boards
	 */
	$scope.loadUserData = function() {
		$log.info('loadUserData()');

		var params = {
			filter: 'open',
		};
		Trello.get("members/me/boards", params, function(boards) {
			$scope.$apply(function() {
            	$scope.boards = [];
            	$scope.boards.push({
            		name: 'Cards I\'m assigned to'
            	});
            	angular.forEach(boards, function(board) {
                	$scope.boards.push(board);
            	});
				$log.info('Boards loaded');
			});
		});
	};

	/**
	 * Load boards
	 */
	$scope.loadCards = function() {
		$log.info('loadCards() ' + $scope.selectedUrgentDate);

        // Output a list of all of the cards that the member
        // is assigned to
        var params = {
        	fields: 'name,labels,due,url',
        };
        Trello.get("members/me/cards", params, function(cards) {
        	$scope.$apply(function(){
            	$scope.cards = [];
            	angular.forEach(cards, function(card) {
            		if (card.due) {
            			// local card date handled with momentjs
            			card.due = moment(card.due);
            		}
                	$scope.cards.push(card);
            	});
        		$log.info("Cards loaded.");
            });

   //      	$("li.card").draggable({
   //      		appendTo: 'body',
   //      		containment: 'window',
   //      		helper: 'clone',
   //      		revert: true,
   //      		stack: "li.card",
   //      		start: function(){
   //      			$(this).hide();
   //      		},
   //      		stop: function(){
   //      			$(this).show();
   //      		}
			// });
        });
	};

	$scope.selectBoard = function(board) {
		$scope.selectedBoard = board;
		$scope.dropdownBoardOpened = false;
		$log.info('selectedBoard: ' + $scope.selectedBoard.name);
	}

	$scope.selectLabel = function(label) {
		$scope.selectedLabel = label;
		$scope.selectedLabelClass = 'label-' + label;
		$scope.dropdownLabelOpened = false;
	};

	$scope.openDatepicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.datepickerOpened = true;
	}

	$scope.cardIsImportant = function(item) {
		return (item.labels.length > 0)
			&& item.labels.some(function(i) {
				return i.color == $scope.selectedLabel;
			});
	};

	$scope.cardIsUrgent = function(item) {
		//$log.info(item.name + ' due: ' + new Date(item.due));
		return (item.due != null)
			&& item.due.isBefore(moment($scope.selectedUrgentDate));
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

	$scope.onDropUrgentAndImportantComplete = function(data, evt) {
		$log.info('drop success, data: ', data);

		if (!$scope.cardIsUrgent(data)) {
			data.due = moment($scope.selectedUrgentDate).subtract('days', 1);
		}

		if (!$scope.cardIsImportant(data)) {
			data.labels.push({ color: $scope.selectedLabel, name: '', });
		}
	};

	$scope.onDropImportantComplete = function(data, evt) {
		$log.info('drop success, data: ', data);
	};
	$scope.onDropUrgentComplete = function(data, evt) {
		$log.info('drop success, data: ', data);
	};
	$scope.onDropNotUrgentNorImportantComplete = function(data, evt) {
		$log.info('drop success, data: ', data);
	};

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

	$scope.init();
}]);