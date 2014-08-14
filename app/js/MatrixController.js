/**
 * Matrix controller containing most of the action.
 */
angular.module('myApp.controllers').controller('MatrixController', ['$scope', '$log', '$filter', 'AuthService', '$analytics', function($scope, $log, $filter, AuthService, $analytics) {

	$scope.userAuthorized = false;

	/* Setting default values */
	$scope.datepickerOpened = false;
	$scope.dropdownBoardOpened = false;
	$scope.dropdownLabelOpened = false;

	$scope.cards = [];
	$scope.selectedCard = null;

	$scope.boards = [];
	$scope.selectedBoard = null;

	$scope.labelNames = ['green','yellow','orange','red','purple','blue'];
	$scope.selectedLabelColor = "red";
	$scope.selectedLabelColorClass = 'label-red';

	$scope.selectedUrgentDate = moment().toDate();

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
			$scope.userAuthorized = true;
			$scope.loadUserData();
		}

		// Register this controller on AuthService.authorized
		$scope.$on('authorized', function(e, args) {
			$scope.userAuthorized = true;
			$scope.loadUserData();
		});

		$scope.$on('deauthorized', function(e, args) {
			$scope.userAuthorized = false;
			$scope.boards = [];
			$scope.cards = [];
		});

		$scope.$watch('selectedLabelColor', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				$analytics.eventTrack('importantLabelUpdated', {
					category: 'trello',
					label: newVal,
					value: 1,
				});
			}
		});

		$scope.$watch('selectedUrgentDate', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				$analytics.eventTrack('urgentDateUpdated', {
					category: 'trello',
					label: 'offset',
					value: moment(newVal).diff(moment(), 'days'),
				});
			}
		});
	};

	/**
	 * Additional login action
	 */
	$scope.login = function() {
		AuthService.authorize();
	};

	/**
	 * Load boards
	 */
	$scope.loadUserData = function() {
		$log.info('loadUserData()');

		var allAssignedBoard = {
			id: null,
    		name: 'Cards I\'m assigned to',
    		cardsUrl: 'members/me/cards',
    	};

		var allVisibleBoard = {
			id: null,
    		name: 'All cards I\'m allowed to see',
    		cardsUrl: 'members/me/cards', // TODO, more complex option needed
    	};

		var params = {
			filter: 'open',
			lists: 'all',
		};
		Trello.get("members/me/boards", params, function(boards) {
			$scope.$apply(function() {
            	$scope.boards = {};
            	$scope.boards[0] = allAssignedBoard;
            	//$scope.boards.push(allVisibleBoard);
            	angular.forEach(boards, function(board) {
            		// Add url for board card retrieval
            		board.cardsUrl = 'boards/'+board.id+'/cards';

            		// Use object instead of array for lists to simplify access
            		board.indexedLists = {};
            		angular.forEach(board.lists, function(list) {
            			board.indexedLists[list.id] = list;
            		});
            		board.lists = null;
                	$scope.boards[board.id] = board;
            	});

            	$scope.selectedBoard = allAssignedBoard;
				$log.info('Boards loaded');

				// After loading boards, trigger loading cards
				$scope.loadCards();
			});
		});
	};

	/**
	 * Load boards
	 */
	$scope.loadCards = function() {
		$log.info('loadCards() ' + $scope.selectedUrgentDate);

		if (!$scope.selectedBoard) {
			$log.warn('No board selected');
			return;
		}

		$analytics.eventTrack('loadCards', {
			category: 'trello',
			label: ($scope.selectedBoard.id ? 'userboard' : 'assignedCards'),
			value: 1,
		});

        // Output a list of all of the cards that the member
        // is assigned to
        var params = {
        	fields: 'name,labels,due,url,idBoard,idList',
        };
        Trello.get($scope.selectedBoard.cardsUrl, params, function(cards) {
        	$scope.$apply(function(){
            	$scope.cards = [];
            	angular.forEach(cards, function(card) {
            		// Exclude done cards
            		if ($scope.cardIsDone(card)) {
            			$log.info('Excluding done card: ' + card.name);
            			return;
            		}

            		if (card.due) {
            			// local card date handled with momentjs
            			card.due = moment(card.due);
            		}
            		card.listname = '-'; // initialize with empty listname
                	$scope.cards.push(card);
            	});
        		$log.info("Cards loaded.");
            });
        });
	};

	$scope.selectBoard = function(board) {
		$scope.selectedBoard = board;
		$scope.dropdownBoardOpened = false;
		$log.info('selectedBoard: ' + $scope.selectedBoard.name);
	}

	$scope.selectLabel = function(label) {
		$scope.selectedLabelColor = label;
		$scope.selectedLabelColorClass = 'label-' + label;
		$scope.dropdownLabelOpened = false;
	};

	$scope.openDatepicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.datepickerOpened = true;
	}

	/**
	 * Open card details modal to edit due date
	 */
	$scope.openCardDetails = function($event, card) {
		$scope.selectedCard = card;
		$scope.selectedCard.selectedDueDate = (card.due ? card.due.toDate() : null);
		$('#trelloCardModal').modal();
		$event.preventDefault();
		$event.stopPropagation();
	}

	$scope.trelloCardModalSave = function() {
		if ($scope.selectedCard) {
			var card = $scope.selectedCard;

			// Update card in trello
			Trello.put(
				"cards/" + card.id + "/due",
				{ value: (card.selectedDueDate ? moment(card.selectedDueDate).toJSON() : null), },
				function(newCard) {
					$scope.$apply(function() {
						card.due = newCard.due ? moment(newCard.due) : null;
					});
				}
			);
		}
		$('#trelloCardModal').modal('hide');
	}

	$scope.trelloCardClearDueDate = function() {
		$scope.selectedCard.selectedDueDate = null;
	}

	/**
	 * cardIsDone checks if a card is part of a board with the name "done"
	 * TODO: add option for label
	 * TODO: add option to include/exclude done cards from matrix
	 */
	$scope.cardIsDone = function(card) {
		var b = $scope.boards[card.idBoard];
		var c = b && b.indexedLists[card.idList];
		return c && c.name.toLowerCase()==="done";
	}

	$scope.cardIsImportant = function(item) {
		return (item.labels.length > 0)
			&& item.labels.some(function(i) {
				return i.color == $scope.selectedLabelColor;
			});
	};

	$scope.cardIsUrgent = function(item) {
		if (!item.due) {
			return false;
		}
		var x = moment($scope.selectedUrgentDate);
		return item.due.isBefore(x, 'day') || item.due.isSame(x, 'day');
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

	/**
	 * Write new value for the due date to trello
	 */
	$scope.updateCardUrgency = function(card, isUrgent) {
		// Update card in trello
		Trello.put(
			"cards/" + card.id + "/due",
			{ value: (isUrgent ? moment($scope.selectedUrgentDate).toJSON() : null) },
			function(newCard) {
				$scope.$apply(function() {
					card.due = newCard.due ? moment(newCard.due) : null;
				});
			}
		);
	}

	/**
	 * Write new value for labels to trello
	 */
	$scope.updateCardImportance = function(card, isImportant) {
		// Update card in trello
		var newLabels = [];
		if (isImportant) {
			// Add the label
			newLabels.push($scope.selectedLabelColor);
			angular.forEach(card.labels, function(label) {
				newLabels.push(label.color);
			});
		} else {
			// Remove the label
			angular.forEach(card.labels, function(label) {
				if (label.color != $scope.selectedLabelColor) {
					newLabels.push(label);
				}
			});
		}

		Trello.put(
			"cards/" + card.id + "/labels",
			{ value: newLabels.join() },
			function(newCard) {
				$scope.$apply(function() {
					card.labels = newCard.labels;
				});
			}
		);
	}

	$scope.onDropUrgentAndImportantComplete = function(card, evt) {
		$log.info('drop success, card: ', card);
		if (!$scope.cardIsUrgent(card)) {
			$scope.updateCardUrgency(card, true);
		}
		if (!$scope.cardIsImportant(card)) {
			$scope.updateCardImportance(card, true);
		}
	};
	$scope.onDropImportantComplete = function(card, evt) {
		$log.info('drop success, card: ', card);
		if ($scope.cardIsUrgent(card)) {
			$scope.updateCardUrgency(card, false);
		}
		if (!$scope.cardIsImportant(card)) {
			$scope.updateCardImportance(card, true);
		}
	};
	$scope.onDropUrgentComplete = function(card, evt) {
		$log.info('drop success, card: ', card);
		if (!$scope.cardIsUrgent(card)) {
			$scope.updateCardUrgency(card, true);
		}
		if ($scope.cardIsImportant(card)) {
			$scope.updateCardImportance(card, false);
		}
	};
	$scope.onDropNotUrgentNorImportantComplete = function(card, evt) {
		$log.info('drop success, card: ', card);
		if ($scope.cardIsUrgent(card)) {
			$scope.updateCardUrgency(card, false);
		}
		if ($scope.cardIsImportant(card)) {
			$scope.updateCardImportance(card, false);
		}
	};

	$scope.init();
}]);