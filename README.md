# first things first - trello priorities board

This application provides a special view on your [Trello](http://trello.com) cards.

The view is based on the so-called "Eisenhower-Matrix" which splits the tasks into
separate lists for urgent and important tasks.

This application uses regular Trello cards and one user-defined label for the priority
and the due date for the urgency property.

## Coding notes

### Drag and drop directives

Currently the app uses "fatlinesofcode/ngDraggable" for drag&drop.
There are some issues with that but without investing too much of time it's the
best solution I have been able to find.

These are the alternatives I have found:

* (in use) https://github.com/fatlinesofcode/ngDraggable
* https://github.com/logicbomb/lvlDragDrop - the sample looks good and reactive but it's
  based on dom elements instead of data items
* https://github.com/codef0rmer/angular-dragdrop - sample looks fine too, but it seems
  this relies on lists in ng-model

### angular-seed

The code of this project is based on [angular-seed](https://github.com/angular/angular-seed.git).
All details about how to build and run the app can be found on the angular-seed page.
