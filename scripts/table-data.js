'use strict';
/*global module: false, require: false*/

var State = require('ampersand-state');
var Input = require('./cell-data');
var Output = require('./cell-data');

var Clause = require('./clause-data');

var DecisionTableModel = State.extend({
  collections: {
    inputs:       Input.Collection,
    outputs:      Output.Collection,
    clauses:      Clause.Collection
  },

  props: {
    name: 'string'
  }
});

module.exports = {
  Model: DecisionTableModel
};