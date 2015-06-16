'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var DecisionTable = require('./table-data');
var RuleView = require('./rule-view');









var DecisionTableControlsView = View.extend({
  autoRender: true,

  session: {
    focusedRule: {
      default: 0,
      type: 'number'
    },

    focusedColumn: {
      default: 0,
      type: 'number'
    }
  },

  derived: {
    data: {
      deps: ['parent', 'parent.model'],
      fn: function () {
        return this.parent.model;
      }
    },


    focusedCell: {
      deps: ['model'],
      fn: function () {
        return this.data.rules.at();
      }
    },

    focusedType: {
      deps: ['focusedCell'],
      fn: function () {
        return this.focusedColumn === this.data.rules.at(0).cell.length - 1 ?
                  'annotation' :
                  this.focusedColumn < this.data.inputs.length ?
                    'input' :
                    'output';
      }
    }
  },

  template: '<div class="controls">' +
              '<div class="coordinates"></div>' +
              /*
              '<ul class="table actions">' +
                '<li class="add"><a>Add</a></li>' +
              '</ul>' +
              '<ul class="inputs actions">' +
                '<li class="add"><a>Add input</a></li>' +
              '</ul>' +
              '<ul class="outputs actions">' +
                '<li class="add"><a>Add output</a></li>' +
              '</ul>' +
              */
              '<ul class="rules actions">' +
                '<li class="add"><a>Add row</a></li>' +
              '</ul>' +
            '</div>',

  events: {
    'click .actions.rules .add': '_handleRuleAdd'
  },

  _handleRuleAdd: function () {
    this.data.rules.add({
      cells: this.makeRuleCells()
    });
  },

  makeRuleCells: function (){
    var cells = [];
    var c;
    for (c = 0; c < this.data.inputs.length; c++) {
      cells.push({
        value: '',
        choices: this.data.inputs.at(c).choices,
        type: 'input'
      });
    }
    for (c = 0; c < this.data.outputs.length; c++) {
      cells.push({
        value: '',
        choices: this.data.outputs.at(c).choices,
        type: 'output'
      });
    }
    cells.push({
      value: '',
      type: 'annotation'
    });
    return cells;
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      coordinatesEl:    '.coordinates',
      tableActionsEl:   '.table.actions',
      inputsActionsEl:  '.inputs.actions',
      outputsActionsEl: '.outputs.actions',
      rulesActionsEl: '.rules.actions'
    });

    return this;
  }
});











var DecisionTableView = View.extend({
  autoRender: true,

  template: '<div class="dmn-table">' +
              '<div data-hook="controls"></div>' +
              '<header>' +
                '<h3 data-hook="table-name"></h3>' +
              '</header>' +
              '<table>' +
                '<thead>' +
                  '<tr>' +
                    '<th class="hit" rulespan="4"></th>' +
                    '<th class="input double-border-right" colspan="2">Input</th>' +
                    '<th class="output" colspan="2">Output</th>' +
                    '<th class="annotation" rulespan="4">Annotation</th>' +
                  '</tr>' +
                  '<tr class="labels"></tr>' +
                  '<tr class="values"></tr>' +
                  '<tr class="mappings"></tr>' +
                '</thead>' +
                '<tbody></tbody>' +
              '</table>' +
            '</div>',
  subviews: {
    controls: {
      container: '[data-hook="controls"]',
      prepareView: function (el) {
        var view = new DecisionTableControlsView({
          model:  this.model,
          parent: this,
          el:     el
        });

        this.listenToAndRun(this.model.rules, 'reset', function () {
          view.render();
        });
        
        return view;
      }
    }
  },

  initialize: function () {
    this.model = this.model || new DecisionTable.Model();
  },

  update: function () {
    return this;
  },

  parseChoices: function (el) {
    if (!el) {
      return 'MISSING';
    }
    var content = el.textContent.trim();
    
    if (content[0] === '(' && content.slice(-1) === ')') {
      return content
        .slice(1, -1)
        .split(',')
        .map(function (str) {
          return str.trim();
        })
        .filter(function (str) {
          return !!str;
        })
        ;
    }

    return [];
  },

  parseRules: function (ruleEls) {
    return ruleEls.map(function (el) {
      return el.textContent.trim();
    });
  },

  parseTable: function () {
    var inputs = [];
    var outputs = [];
    var rules = [];

    this.queryAll('thead .labels .input').forEach(function (el, num) {
      var choiceEls = this.query('thead .values .input:nth-child(' + (num + 1) + ')');

      inputs.push({
        label:    el.textContent.trim(),
        choices:  this.parseChoices(choiceEls)
      });
    }, this);

    this.queryAll('thead .labels .output').forEach(function (el, num) {
      var choiceEls = this.query('thead .values .output:nth-child(' + (num + inputs.length + 1) + ')');

      outputs.push({
        label:    el.textContent.trim(),
        choices:  this.parseChoices(choiceEls)
      });
    }, this);

    this.queryAll('tbody tr').forEach(function (row) {
      var cells = [];
      var cellEls = row.querySelectorAll('td');

      for (var c = 1; c < cellEls.length; c++) {
        var choices = null;
        var value = cellEls[c].textContent.trim();
        var type = c <= inputs.length ? 'input' : (c < (cellEls.length - 1) ? 'output' : 'annotation');
        var oc = c - (inputs.length + 1);

        if (type === 'input' && inputs[c - 1]) {
          choices = inputs[c - 1].choices;
        }
        else if (type === 'output' && outputs[oc]) {
          choices = outputs[oc].choices;
        }

        cells.push({
          value:    value,
          choices:  choices
        });
      }

      rules.push({
        cells: cells
      });
    });

    this.model.name = this.query('h3').textContent.trim();
    this.model.inputs.reset(inputs);
    this.model.outputs.reset(outputs);
    this.model.rules.reset(rules);

    return this.toJSON();
  },
  
  toJSON: function () {
    return this.model.toJSON();
  },

  render: function () {
    if (!this.el) {
      this.renderWithTemplate();
    }
    else {
      this.parseTable();
    }

    if (!this.headerEl) {
      this.cacheElements({
        labelEl:  'header h3',
        headerEl: 'thead',
        bodyEl:   'tbody'
      });
    }

    this.bodyEl.innerHTML = '';
    this.rulesView = this.renderCollection(this.model.rules, RuleView, this.bodyEl);

    return this.update();
  }
});

module.exports = DecisionTableView;