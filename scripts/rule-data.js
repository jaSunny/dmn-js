'use strict';
/*global module: false, require: false, deps: false*/

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');
var Cell = require('./cell-data');

var RuleModel = State.extend({
  session: {
    focused: 'boolean'
  },

  collections: {
    cells: Cell.Collection
  },

  derived: {
    delta: {
      dep: ['collection'],
      fn: function () {
        return 1 + this.collection.indexOf(this);
      }
    },

    inputCells: {
      dep: ['cells', 'collection.parent.inputs'],
      fn: function () {
        return this.cells.models.slice(0, this.collection.parent.inputs.length);
      }
    },

    outputCells: {
      dep: ['cells', 'collection.parent.inputs'],
      fn: function () {
        return this.cells.models.slice(this.collection.parent.inputs.length, -1);
      }
    },

    annotation: {
      dep: ['cells'],
      fn: function () {
        return this.cells.models[this.cells.length - 1];
      }
    }
  }
});

module.exports = {
  Model: RuleModel,

  Collection: Collection.extend({
    model: RuleModel,

    // initialize: function () {
    //   var table = this.parent;

    //   function ruleMapChoices(rule) {
    //     rule.cells.forEach(function (cell, c) {
    //       var clause;

    //       if (c < table.inputs.length) {
    //         clause = table.inputs.at(c);
    //       }
    //       else if (c < (rule.cells.length - 1)) {
    //         clause = table.outputs.at(c - (table.inputs.length - 0));
    //       }
    //     });
    //   }

    //   this.listenTo(table.inputs, 'reset', function (inputs) {
    //     // console.info('inputs reset', inputs/*, arguments[1], arguments[2]*/);
    //     this.forEach(ruleMapChoices);
    //   });

    //   this.listenTo(table.outputs, 'reset', function (outputs) {
    //     // console.info('outputs reset', outputs/*, arguments[1], arguments[2]*/);
    //     this.forEach(ruleMapChoices);
    //   });

    //   this.listenTo(table.inputs, 'add', function (input) {
    //     // console.info('inputs add', input/*, arguments[1], arguments[2]*/);
    //     this.forEach(ruleMapChoices);
    //   });

    //   this.listenTo(table.outputs, 'add', function (output) {
    //     // console.info('outputs add', output/*, arguments[1], arguments[2]*/);
    //     this.forEach(ruleMapChoices);
    //   });

    //   // this.listenTo(table.inputs, 'remove', function () {
    //   //   console.info('inputs remove', arguments[0]/*, arguments[1], arguments[2]*/);
    //   // });

    //   // this.listenTo(table.outputs, 'remove', function () {
    //   //   console.info('outputs remove', arguments[0]/*, arguments[1], arguments[2]*/);
    //   // });

    //   this.on('add', ruleMapChoices);

    //   this.on('reset', function () {
    //     this.forEach(ruleMapChoices);
    //   });
    // }
  })
};
