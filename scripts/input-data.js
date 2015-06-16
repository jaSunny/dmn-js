'use strict';
/*global module: false, require: false*/

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var InputModel = State.extend({
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
  Model: InputModel,
  Collection: Collection.extend({
    model: InputModel
  })
};