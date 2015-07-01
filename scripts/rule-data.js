'use strict';
/*global module: false, deps: true, require: false*/

if (typeof window === 'undefined') { var deps = require; }
else { var deps = window.deps; }

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');
var Cell = require('./cell-data');

var RuleModel = State.extend({
  collections: {
    cells: Cell.Collection
  },

  derived: {
    table: {
      deps: [
        'collection',
        'collection.parent'
      ],
      cache: false,
      fn: function () {
        return this.collection.parent;
      }
    },

    focused: {
      deps: [
        'collection',
        'table'
      ],
      cache: false,
      fn: function () {
        return this.collection.indexOf(this) === this.table.y;
      }
    },


    delta: {
      deps: ['collection'],
      cache: false,
      fn: function () {
        return 1 + this.collection.indexOf(this);
      }
    },

    inputCells: {
      deps: ['cells', 'table.inputs'],
      cache: false,
      fn: function () {
        return this.cells.models.slice(0, this.table.inputs.length);
      }
    },

    outputCells: {
      deps: ['cells', 'table.inputs'],
      cache: false,
      fn: function () {
        return this.cells.models.slice(this.table.inputs.length, -1);
      }
    },

    annotation: {
      deps: ['cells'],
      cache: false,
      fn: function () {
        return this.cells.models[this.cells.length - 1];
      }
    }
  },

  ensureCells: function () {
    var c = this.table.inputs.length + this.table.outputs.length + 1;

    // fine
    if (this.cells.length === c || c === 1) {
      return;
    }

    // needs to be filled
    if (this.cells.length < c) {
      while (this.cells.length <= c) {
        this.cells.add({value:''});
      }
    }

    // needs to be truncated
    else {
      this.cells.models = this.cells.models.slice(0, c);
    }
  },

  initialize: function () {
    this.listenTo(this.table.inputs, 'reset', this.ensureCells);
    this.listenToAndRun(this.table.outputs, 'reset', this.ensureCells);
  }
});

module.exports = {
  Model: RuleModel,

  Collection: Collection.extend({
    model: RuleModel,
  })
};
