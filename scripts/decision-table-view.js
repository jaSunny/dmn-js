'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');

function elPosition(el) {
  var node = el;
  var top = node.offsetTop;
  var left = node.offsetLeft;

  while ((node = node.offsetParent)) {
    top += node.offsetTop;
    left += node.offsetLeft;
  }

  return {
    top: top,
    left: left
  };
}

var ChoiceView = require('./choice-view');
var ClauseCellView = View.extend(merge(ChoiceView.prototype, {
  bindings: merge({}, ChoiceView.prototype.bindings, {
    'model.value': {
      type: 'text'
    },

    'model.editable': {
      type: 'booleanAttribute',
      name: 'contenteditable'
    }
  })
}));



var ClauseInputCellView = ClauseCellView.extend({
  bindings: merge({}, ClauseCellView.prototype.bindings, {
    last: {
      type: 'booleanClass',
      name: 'double-border-right'
    }
  }),

  derived: {
    last: {
      deps: [
        'model.collection',
        'parent.inputs'
      ],
      fn: function () {
        var index = this.model.collection.indexOf(this.model);
        return index === (this.parent.inputs.length - 1);
      }
    }
  },

  template: '<td class="input"></td>'
});




var ClauseOutputCellView = ClauseCellView.extend({
  template: '<td class="output"></td>'
});





var ClauseAnnotationCellView = ClauseCellView.extend({
  template: '<td class="annotation"></td>'
});





var ClauseView = View.extend({
  template: '<tr><td class="number"></td></tr>',

  bindings: {
    'model.delta': {
      type: 'text',
      selector: '.number'
    }
  },

  derived: {
    inputs: {
      deps: ['parent.model.inputs'],
      fn: function () {
        return this.parent.model.inputs;
      }
    },

    outputs: {
      deps: ['parent.model.outputs'],
      fn: function () {
        return this.parent.model.outputs;
      }
    },

    annotation: {
      deps: ['parent.model.annotations'],
      fn: function () {
        return this.parent.model.annotations.at(0);
      }
    },

    position: {
      deps: ['el', 'parent'],
      cache: false, // because of resize
      fn: function () { return elPosition(this.el); }
    }
  },

  session: {
    focused: 'boolean'
  },

  events: {
    'focus td':   '_handleFocus',
    'blur td':    '_handleBlur'
  },

  _handleFocus: function () {
    this.focused = true;
    this.positionControls();
  },

  _handleBlur: function () {
    this.focused = false;
  },

  positionControls: function () {
    if (!this.controlsEl) {
      return;
    }

    var pos = this.position;

    var controlsEl = this.controls.el;
    controlsEl.style.top = pos.top + 'px';
    controlsEl.style.left = pos.left + 'px';
  },

  initialize: function () {
    var root = this.model.collection.parent;
    this.listenToAndRun(root.clauses, 'reset', this.render);
    this.listenToAndRun(root.inputs, 'reset', this.render);
    this.listenToAndRun(root.outputs, 'reset', this.render);
  },

  render: function () {
    this.renderWithTemplate();

    var i;
    var subview;
    
    for (i = 0; i < this.inputs.length; i++) {
      subview = new ClauseInputCellView({
        model:  this.model.inputCells[i],
        parent: this
      });
      
      this.registerSubview(subview.render());
      this.el.appendChild(subview.el);
    }

    for (i = 0; i < this.outputs.length; i++) {
      subview = new ClauseOutputCellView({
        model:  this.model.outputCells[i],
        parent: this
      });
      
      this.registerSubview(subview.render());
      this.el.appendChild(subview.el);
    }
    subview = new ClauseAnnotationCellView({
      model:  this.model.annotation,
      parent: this
    });
    this.registerSubview(subview.render());
    this.el.appendChild(subview.el);

    this.on('change:el change:parent', this.positionControls);

    this.positionControls();

    return this;
  }
});








var DecisionTableControlsView = View.extend({
  autoRender: true,

  session: {
    focusedClause: {
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
        return this.data.clauses.at();
      }
    },

    focusedType: {
      deps: ['focusedCell'],
      fn: function () {
        return this.focusedColumn === this.data.clauses.at(0).cell.length - 1 ?
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
              '<ul class="clauses actions">' +
                '<li class="add"><a>Add clause</a></li>' +
              '</ul>' +
            '</div>',

  events: {
    'click .actions.clauses .add': '_handleClauseAdd'
  },

  _handleClauseAdd: function () {
    this.data.clauses.add({
      cells: this.makeClauseCells()
    });
  },

  makeClauseCells: function (){
    var cells = [];
    var c;
    for (c = 0; c < this.data.inputs.length; c++) {
      cells.push({
        value: '',
        type: 'input'
      });
    }
    for (c = 0; c < this.data.outputs.length; c++) {
      cells.push({
        value: '',
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
      clausesActionsEl: '.clauses.actions'
    });

    return this;
  }
});








var DecisionTable = require('./table-data');



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
                    '<th class="hit" clausespan="4"></th>' +
                    '<th class="input double-border-right" colspan="2">Input</th>' +
                    '<th class="output" colspan="2">Output</th>' +
                    '<th class="annotation" clausespan="4">Annotation</th>' +
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

        this.listenToAndRun(this.model.clauses, 'reset', function () {
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

  parseClauses: function (clauseEls) {
    return clauseEls.map(function (el) {
      return el.textContent.trim();
    });
  },

  parseTable: function () {
    var inputs = [];
    var outputs = [];
    var clauses = [];

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

      clauses.push({
        cells: cells
      });
    });

    this.model.name = this.query('h3').textContent.trim();
    this.model.inputs.reset(inputs);
    this.model.outputs.reset(outputs);
    this.model.clauses.reset(clauses);

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
    this.clausesView = this.renderCollection(this.model.clauses, ClauseView, this.bodyEl);

    return this.update();
  }
});

module.exports = DecisionTableView;