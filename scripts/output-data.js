'use strict';
/*global module: false, require: false*/

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var OutputModel = State.extend({
  props: {
    name: 'string',
    choices: 'array',
    mapping: 'string'
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
  Model: OutputModel,
  Collection: Collection.extend({
    model: OutputModel
  })
};