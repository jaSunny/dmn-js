'use strict';
/*global module: false, require: false*/

var Clause = require('./clause-data');

var InputModel = Clause.Model.extend({
  clauseType: 'input',

  props: {
    source:      'string',
    language:    {type: 'string', default: 'Javascript'},
    mappingType: {
      type: 'string',
      default: 'expression',
      test: function (newVal) {
        if (newVal !== 'expression' && newVal !== 'script') {
          return 'mappingType must be either "script" or "expression"';
        }
      }
    }
  },

  derived: {
    x: {
      deps: [
        'collection'
      ],
      cache: false,
      fn: function () {
        return this.collection.indexOf(this);
      }
    },

    focused: {
      deps: [
        'collection',
        'collection.parent'
      ],
      cache: false,
      fn: function () {
        return this.collection.parent.x === this.x;
      }
    },

    mapping: {
      deps: [
        'expression',
        'language',
        'source'
      ],
      fn: function () {
        if (this.mappingType === 'script') {
          return this.language;
        }

        return this.expression;
      }
    }
  }
});

module.exports = {
  Model: InputModel,
  Collection: Clause.Collection.extend({
    model: InputModel
  })
};
