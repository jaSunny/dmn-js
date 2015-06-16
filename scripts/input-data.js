'use strict';
/*global module: false, require: false*/

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');

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