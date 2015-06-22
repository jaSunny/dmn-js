'use strict';
/*global deps:false, require:false, module:false*/
var View = deps('ampersand-view');

var ContextMenuView = require('./contextmenu-view');
var contextMenu = ContextMenuView.instance();
var utils = require('./utils');



var ScopeControlsView = View.extend({
  autoRender: true,

  template: '<span class="ctrls"></span>',

  derived: {
    offset: {
      cache: false,
      fn: function () {
        return utils.elOffset(this.el);
      }
    }
  },

  session: {
    scope: 'state',

    commands: {
      type: 'array',
      default: function () { return []; }
    }
  },

  events: {
    click: '_handleClick'
  },

  _handleClick: function () {
    var options = this.offset;
    options.left += this.el.clientWidth;
    options.commands = this.commands || [];
    contextMenu.open(options);
  }
});

module.exports = ScopeControlsView;
