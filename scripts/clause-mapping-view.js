'use strict';
/* global module: false, deps: false, require: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var contextViewsMixin = require('./context-views-mixin');



var MappingView = View.extend(merge({}, {
  events: {
    'click':       '_handleClick'
  },

  derived: merge({}, contextViewsMixin, {
    table: {
      deps: [
        'model',
        'model.collection',
        'model.collection.parent'
      ],
      cache: false,
      fn: function () {
        return this.model.collection.parent;
      }
    }
  }),

  bindings: {
    'model.mapping': [
      {
        type: 'text'
      },
      {
        type: 'attribute',
        name: 'title'
      }
    ]
  },

  _handleClick: function () {
    this.contextMenu.close();
    if (this.model.clauseType === 'input') {
      this.clauseExpressionEditor.show(this.model, this);
    }
    else {
      this.clauseExpressionEditor.hide();
    }
    this.clauseValuesEditor.hide();
  },

  _handleInput: function () {
    this.model.mapping = this.el.textContent.trim();
  },

  initialize: function () {
    this.el.textContent = (this.model.mapping || '').trim();
  }
}));

module.exports = MappingView;
