'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var contextViewsMixin = require('./context-views-mixin');

var ValueView = View.extend(merge({}, {
  events: {
    // 'contextmenu':    '_handleContextMenu',
    'click':          '_handleClick'
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
    'model.choices': {
      type: function (el) {
        this._renderContent(el);
      }
    },
    'model.datatype': {
      type: function (el) {
        this._renderContent(el);
      }
    }
  },

  // _handleContextMenu: function (evt) {
  //   if (evt.defaultPrevented) { return; }
  //   this.clauseValuesEditor.show(this.model.datatype, this.model.choices, this);
  //   evt.preventDefault();
  // },

  _handleClick: function () {
    this.contextMenu.close();
    this.clauseExpressionEditor.hide();
    this.clauseValuesEditor.show(this.model.datatype, this.model.choices, this);
  },

  _renderContent: function (el) {
    var str = '';
    var val = this.model.choices;
    if (Array.isArray(val) && val.length) {
      str = '(' + val.join(', ') + ')';
    }
    else {
      str = this.model.datatype;
    }
    el.textContent = str;
  }
}));




module.exports = ValueView;
