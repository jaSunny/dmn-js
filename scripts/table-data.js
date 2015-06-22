'use strict';
/*global module: false, deps: false, require: false*/

var State = deps('ampersand-state');
var Input = require('./input-data');
var Output = require('./output-data');

var Rule = require('./rule-data');

var DecisionTableModel = State.extend({
  collections: {
    inputs:   Input.Collection,
    outputs:  Output.Collection,
    rules:    Rule.Collection
  },

  props: {
    name: 'string'
  },

  session: {
    x: {
      type: 'number',
      default: 0
    },

    y: {
      type: 'number',
      default: 0
    }
  },


  _clipboard: null,







  addRule: function (scopeCell) {
    var cells = [];
    var c;

    for (c = 0; c < this.inputs.length; c++) {
      cells.push({
        value: '',
        choices: this.inputs.at(c).choices,
        focused: c === 0
      });
    }

    for (c = 0; c < this.outputs.length; c++) {
      cells.push({
        value: '',
        choices: this.outputs.at(c).choices
      });
    }

    cells.push({
      value: ''
    });

    // var rule =
    this.rules.add({
      cells: cells
    });

    // rule.cells.forEach(function (cell, c) {
    //   var clause;
    //   if (c < this.inputs.length) {
    //     clause = this.inputs.at(c);
    //     cell.listenTo(clause, 'change:choices', function () {
    //       cell.choices = clause.choices;
    //     });
    //   }
    //   else if (c < (rule.cells.length - 1)) {
    //     clause = this.outputs.at(c - (this.inputs.length - 0));
    //     cell.listenTo(clause, 'change:choices', function () {
    //       cell.choices = clause.choices;
    //     });
    //   }
    // }, this);
  },

  removeRule: function (scopeCell) {
    this.rules.remove(scopeCell.collection.parent);
    this.rules.trigger('reset');
  },


  copyRule: function (scopeCell, upDown) {
    var ruleDelta = this.rules.indexOf(scopeCell.collection.parent);
    var rule = this.rules.at(ruleDelta);
    if (!rule) { return; }
    if (!upDown) { return; }
  },


  pasteRule: function (delta) {
    if (!this._clipboard) { return; }
    this.rules.add(this._clipboard.toJSON(), {
      at: delta
    });
  },


  _rulesCells: function (added, delta) {
    this.rules.forEach(function (rule) {
      rule.cells.add({
        choices: added.choices
      }, {
        at: delta,
        silent: true
      });
    });
    this.rules.trigger('reset');
  },

  addInput: function () {
    var delta = this.inputs.length;
    this._rulesCells(this.inputs.add({
      label:    null,
      choices:  null,
      mapping:  null,
      datatype: 'string'
    }), delta);
  },

  removeInput: function () {},



  addOutput: function () {
    var delta = this.inputs.length + this.inputs.length - 1;
    this._rulesCells(this.outputs.add({
      label:    null,
      choices:  null,
      mapping:  null,
      datatype: 'string'
    }), delta);
  },

  removeOutput: function () {}
});

window.DecisionTableModel = DecisionTableModel;

module.exports = {
  Model: DecisionTableModel
};
