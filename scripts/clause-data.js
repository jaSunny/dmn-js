'use strict';
/*global module: false, deps: true, require: false*/

if (typeof window === 'undefined') { var deps = require; }
else { var deps = window.deps; }

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');

var ClauseModel = State.extend({
  props: {
    label:        'string',
    choices:      'array',
    datatype:     {type: 'string', default: 'string'},
    mappingType:  {type: 'string', default: 'expression'},
    expression:   {
      type: 'string',
      test: function (val) {
        if (/[^a-z0-9-_]+/ig.test(val)) {
          return 'only alphanumeric charachters are allowed';
        }
      }
    }
  },

  session: {
    editable: {
      type: 'boolean',
      default: true
    }
  }
});

module.exports = {
  Model: ClauseModel,
  Collection: Collection.extend({
    model: ClauseModel
  })
};
