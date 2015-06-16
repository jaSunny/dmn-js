'use strict';
/*global module: false, require: false*/

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var CellModel = State.extend({
  props: {
    value: 'string'
  },

  session: {
    editable: {
      type: 'boolean',
      default: true
    },
    focused: 'boolean'
  }
});

module.exports = {
  Model: CellModel,
  Collection: Collection.extend({
    model: CellModel
  })
};