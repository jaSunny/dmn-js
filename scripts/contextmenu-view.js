'use strict';
/* global module: false, deps: false */

var View = deps('ampersand-view');
var Collection = deps('ampersand-collection');
var State = deps('ampersand-state');

var CommandModel = State.extend({
  props: {
    label:  'string',
    fn: {
      type: 'any',
      default: function () {
        return function () {};
      }
    }
  },

  subcommands: null,

  initialize: function (attributes) {
    this.subcommands = new CommandsCollection(attributes.subcommands || [], {
      parent: this
    });
  }
});

var CommandsCollection = Collection.extend({
  model: CommandModel
});

var ContextMenuItem = View.extend({
  autoRender: true,

  template: '<li>' +
              '<a>' +
                '<span class="icon"></span>' +
                '<span class="label"></span>' +
              '</a>' +
              '<ul class="dropdown-menu"></ul>' +
            '</li>',

  bindings: {
    'model.label': {
      type: 'text',
      selector: '.label'
    },

    'model.disabled': {
      type: 'booleanClass',
      name: 'disabled'
    },

    'model.hidden': {
      type: 'booleanClass',
      name: 'hidden'
    },

    'model.subcommands.length': {
      type: 'booleanClass',
      name: 'dropdown'
    },

    'model.href': {
      selector: 'a',
      type: function (el, value) {
        if (value) {
          el.setAttribute('href', value);
        }
        else {
          el.removeAttribute('href');
        }
      }
    },

    'model.icon': {
      type: function (el, value) {
        el.className = 'icon '+ value;
      },
      selector: '.icon'
    }
  },

  events: {
    click: '_handleClick'
  },

  render: function () {
    this.renderWithTemplate();
    this.listenToAndRun(this.model, 'change:subcommands', function () {
      this.renderCollection(this.model.subcommands, ContextMenuItem, this.query('ul'));
    });
    return this;
  },

  _handleClick: function (evt) {
    this.parent.triggerCommand(this.model, evt);
  },

  triggerCommand: function (model, evt) {
    this.parent.triggerCommand(model, evt);
  }
});





var ContextMenuView = View.extend({
  autoRender: true,

  template: '<nav class="dmn-context-menu">' +
              '<div class="coordinates">' +
                '<label>Coords:</label>' +
                '<span class="x"></span>' +
                '<span class="y"></span>' +
              '</div>' +
              '<ul></ul>' +
            '</nav>',

  collections: {
    commands: CommandsCollection
  },

  session: {
    isOpen: 'boolean'
  },

  bindings: {
    isOpen: {
      type: 'toggle'
    },
    'parent.model.x': {
      type: 'text',
      selector: 'div span.x'
    },
    'parent.model.y': {
      type: 'text',
      selector: 'div span.y'
    }
  },

  open: function (options) {
    var style = this.el.style;

    style.left = options.left + 'px';
    style.top = options.top + 'px';

    this.isOpen = true;

    var commands = options.commands || [
      {
        label: 'Rule',
        subcommands: [
          {
            label: 'add',
            fn: function () {
              this.parent.model.addRule();
            }
          },
          {
            label: 'copy',
            fn: function () {
              this.parent.model.addRule();
            }
          }
        ]
      },
      {
        label: 'Clause',
        subcommands: []
      },
      {
        label: 'Input',
        subcommands: [
          {
            label: 'add',
            fn: function () {
              this.parent.model.addInput();
            }
          }
        ]
      },
      {
        label: 'Output',
        subcommands: [
          {
            label: 'add',
            fn: function () {
              this.parent.model.addOutput();
            }
          }
        ]
      }
    ];

    this.commands.reset(commands);
  },

  triggerCommand: function (command, evt) {
    command.fn.call(this, evt);
    if (!command.keepOpen) {
      this.close();
    }
  },

  close: function () {
    this.isOpen = false;
  },

  render: function () {
    this.renderWithTemplate();
    this.cacheElements({
      commandsEl: 'ul'
    });
    this.commandsView = this.renderCollection(this.commands, ContextMenuItem, this.commandsEl);
    return this;
  }
});

module.exports = ContextMenuView;
