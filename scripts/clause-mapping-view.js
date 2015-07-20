'use strict';
/* global module: false, deps: false, require: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var contextViewsMixin = require('./context-views-mixin');



var MappingView = View.extend(merge({}, {
  events: {
    'click': '_handleClick',
    'keyup [contenteditable]': '_handleKeyup'
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
    ],
    'model.expression': {
      type: function (el, value) {
        if (el === document.activeElement) {
          return;
        }
        el.textContent = value.trim();
      },
      selector: '[contenteditable]'
    },

    error: [
      {
        type: 'booleanClass',
        name: 'invalid'
      },
      {
        type: 'attribute',
        name: 'title'
      }
    ]
  },

  session: {
    error: 'string'
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

  _handleKeyup: function (evt) {
    try {
      this.model.expression = evt.target.textContent.trim();
      if (this.error) {
        this.error = false;
      }
    }
    catch (err) {
      if (!this.error) {
        this.error = err.message;
      }
    }
  },

  initialize: function () {
    var val = (this.model.mapping || '').trim();

    if (this.model.clauseType !== 'input') {
      this.el.innerHTML = '<span contenteditable spellcheck="false">' + val + '</span>';
    }
    else {
      this.el.textContent = val;
    }
  }
}));

module.exports = MappingView;
