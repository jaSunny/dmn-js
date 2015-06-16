'use strict';
/*global module: false, deps: false, require: false*/

var State = deps('ampersand-state');
var Input = require('./cell-data');
var Output = require('./cell-data');

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
  }
});

module.exports = {
  Model: DecisionTableModel
};