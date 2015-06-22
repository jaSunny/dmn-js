'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var ScopeControlsView = require('./scopecontrols-view');



var LabelView = View.extend(merge({
  events: {
    'input .value': '_handleInput',
  },

  _handleInput: function () {
    this.model.label = this.valueEl.textContent.trim();
  },

  render: function () {
    var valueEl = this.valueEl = document.createElement('span');
    valueEl.className = 'value';
    valueEl.setAttribute('contenteditable', true);
    valueEl.textContent = (this.model.label || '').trim();
    this.el.innerHTML = '';
    this.el.appendChild(valueEl);


    var clause = this.model;
    var table = clause.collection.parent;

    var ctrls = new ScopeControlsView({
      parent: this,
      scope: this.model,
      commands: [
        {
          label: 'Remove ' + clause.clauseType,
          icon: 'minus',
          hint: 'Remove the ' + clause.clauseType + ' clause',
          possible: function () {
            return clause.collection.length > 1;
          },
          fn: function () {
            var delta = clause.collection.indexOf(clause);
            clause.collection.remove(clause);

            if (clause.clauseType === 'output') {
              delta += table.inputs.length;
            }

            table.rules.forEach(function (rule) {
              var cell = rule.cells.at(delta);
              rule.cells.remove(cell);
            });
            table.rules.trigger('reset');
          }
        }
      ]
    });
    this.registerSubview(ctrls);
    this.el.appendChild(ctrls.el);
  }
}));




var MappingView = View.extend(merge({
  events: {
    'input': '_handleInput',
  },

  _handleInput: function () {
    this.model.mapping = this.el.textContent.trim();
  },

  render: function () {
    this.el.setAttribute('contenteditable', true);
    this.el.textContent = (this.model.mapping || '').trim();
  }
}));




var ValueView = View.extend(merge({
  events: {
    'input': '_handleInput',
    'focus': '_handleFocus'
  },

  _handleInput: function () {
    var content = this.el.textContent.trim();

    if (content[0] === '(' && content.slice(-1) === ')') {
      this.model.choices = content
        .slice(1, -1)
        .split(',')
        .map(function (str) {
          return str.trim();
        })
        .filter(function (str) {
          return !!str;
        })
        ;
      this.model.datatype = null;
    }
    else {
      this.model.choices = null;
      this.model.datatype = content;
    }
  },

  _handleFocus: function () {

  },

  render: function () {
    this.el.setAttribute('contenteditable', true);
    var str = '';
    if (this.model.choices && this.model.choices.length) {
      str = '(' + this.model.choices.join(', ') + ')';
    }
    else {
      str = this.model.datatype;
    }
    this.el.textContent = str;
  }
}));





var requiredElement = {
  type: 'element',
  required: true
};

var ClauseView = View.extend({
  session: {
    labelEl:    requiredElement,
    mappingEl:  requiredElement,
    valueEl:    requiredElement
  },

  initialize: function () {
    var clause = this.model;

    var subviews = {
      label:    LabelView,
      mapping:  MappingView,
      value:    ValueView
    };

    Object.keys(subviews).forEach(function (kind) {
      this.listenToAndRun(this.model, 'change:' + kind, function () {
        if (this[kind + 'View']) {
          this.stopListening(this[kind + 'View']);
        }

        this[kind + 'View'] = new subviews[kind]({
          parent: this,
          model:  clause,
          el:     this[kind + 'El']
        }).render();
      });
    }, this);
  }
});




module.exports = ClauseView;
