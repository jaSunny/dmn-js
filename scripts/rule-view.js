'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var CellViews = require('./cell-view');
var ScopeControlsView = require('./scopecontrols-view');
var utils = require('./utils');


var RuleView = View.extend({
  template: '<tr><td class="number">' +
              '<span class="value"></span>' +
            '</td></tr>',

  bindings: {
    'model.delta': {
      type: 'text',
      selector: '.number .value'
    },

    'model.focused': {
      type: 'booleanClass',
      name: 'focused'
    }
  },

  derived: {
    inputs: {
      deps: [
        'parent',
        'parent.model',
        'parent.model.inputs'
      ],
      fn: function () {
        return this.parent.model.inputs;
      }
    },

    outputs: {
      deps: [
        'parent',
        'parent.model',
        'parent.model.outputs'
      ],
      fn: function () {
        return this.parent.model.outputs;
      }
    },

    annotation: {
      deps: [
        'parent',
        'parent.model',
        'parent.model.annotations'
      ],
      fn: function () {
        return this.parent.model.annotations.at(0);
      }
    },

    position: {
      deps: [],
      cache: false, // because of resize
      fn: function () { return utils.elOffset(this.el); }
    }
  },

  initialize: function () {
    var root = this.model.collection.parent;
    this.listenToAndRun(root.rules, 'reset', this.render);
    this.listenToAndRun(root.inputs, 'reset', this.render);
    this.listenToAndRun(root.outputs, 'reset', this.render);
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      numberEl: '.number'
    });

    var rule = this.model;
    var table = rule.collection.parent;

    var ctrls = new ScopeControlsView({
      parent: this,
      scope: this.model,
      commands: [
        {
          label: 'Remove rule',
          icon: 'minus',
          hint: 'Remove this rule',
          fn: function () {
            rule.collection.remove(rule);
          }
        },
        {
          label: 'Clear',
          icon: 'clear',
          hint: 'Clear the focused rule',
          fn: function () {
            table.clearRule(rule);
          }
        },
        {
          label: 'Add',
          icon: 'plus',
          fn: function () {
            table.addRule(rule);
          },
          subcommands: [
            {
              label: 'above',
              icon: 'above',
              hint: 'Add a rule above the focused one',
              fn: function () {
                table.addRule(rule, -1);
              }
            },
            {
              label: 'below',
              icon: 'below',
              hint: 'Add a rule below the focused one',
              fn: function () {
                table.addRule(rule, 1);
              }
            }
          ]
        },
        {
          label: 'Copy',
          icon: 'copy',
          fn: function () {
            table.copyRule(rule);
          },
          subcommands: [
            {
              label: 'above',
              icon: 'above',
              hint: 'Copy the rule above the focused one',
              fn: function () {
                table.copyRule(rule, -1);
              }
            },
            {
              label: 'below',
              icon: 'below',
              hint: 'Copy the rule below the focused one',
              fn: function () {
                table.copyRule(rule, 1);
              }
            }
          ]
        }
      ]
    });
    this.registerSubview(ctrls);
    this.numberEl.appendChild(ctrls.el);

    var i;
    var subview;

    for (i = 0; i < this.inputs.length; i++) {
      subview = new CellViews.Input({
        model:  this.model.cells.at(i),
        parent: this
      });

      this.registerSubview(subview.render());
      this.el.appendChild(subview.el);
    }

    for (i = 0; i < this.outputs.length; i++) {
      subview = new CellViews.Output({
        model:  this.model.cells.at(this.inputs.length + i),
        parent: this
      });

      this.registerSubview(subview.render());
      this.el.appendChild(subview.el);
    }
    subview = new CellViews.Annotation({
      model:  this.model.annotation,
      parent: this
    });
    this.registerSubview(subview.render());
    this.el.appendChild(subview.el);

    this.on('change:el change:parent', this.positionControls);

    return this;
  }
});

module.exports = RuleView;
