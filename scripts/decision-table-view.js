'use strict';
/* global require: false, module: false */

var Collection = require('ampersand-collection');
var View = require('ampersand-view');
var State = require('ampersand-state');

var InputsCollection = Collection.extend({});
var OutputsCollection = Collection.extend({});
var AnnotationsCollection = Collection.extend({});
var RowsCollection = Collection.extend({
  collections: {
    columns: Collection
  }
});
// var ClausesCollection = Collection.extend({});

var ControlState = State.extend({

});

var RowControlsView = View.extend({
  template: '<li></li>',
  
  events: {
    click: '_handleClick'
  },

  _handleClick: function () {

  }
});

var RowView = View.extend({
  template: '<tr></tr>',

  collections: {
    controls: Collection.extend({
      model: ControlState
    })
  },

  session: {
    delta: {
      type: 'number',
      default: function () {
        console.info('default delta for row view', this);
        return 0;
      }
    }
  },

  derived: {
    inputs: {
      deps: ['parent.inputs'],
      fn: function () {
        return [];
      }
    },

    outputs: {
      deps: ['parent.outputs'],
      fn: function () {
        return [];
      }
    },

    annotation: {
      deps: ['parent.annotations'],
      fn: function () {
        return '';
      }
    }
  },

  initialize: function () {
    var controls = this.controlsEl = document.createElement('div');
    controls.classList.add('dmn-table-row-controls');
    document.body.appendChild(controls);
  }
});

var DecisionTableView = View.extend({
  autoRender: true,

  template: '<div class="dmn-table">' +
              '<h3 data-hook="table-name"></h3>' +
              '<table>' +
                '<thead>' +
                  '<tr>' +
                    '<th class="hit" rowspan="4"></th>' +
                    '<th class="input double-border-right" colspan="2">Input</th>' +
                    '<th class="output" colspan="2">Output</th>' +
                    '<td class="annotation" rowspan="4">Annotation</td>' +
                  '</tr>' +
                  '<tr class="labels"></tr>' +
                  '<tr class="values"></tr>' +
                  '<tr class="mappings"></tr>' +
                '</thead>' +
                '<tbody></tbody>' +
              '</table>' +
            '</div>',

  collections: {
    inputs:       InputsCollection,
    outputs:      OutputsCollection,
    annotations:  AnnotationsCollection,
    rows:         RowsCollection
  },

  props: {
    name: 'string'
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

  parseClauses: function (rowEls) {
    return rowEls.map(function (el) {
      return el.textContent.trim();
    });
  },

  parseTable: function () {
    var inputs = [];
    var outputs = [];

    console.info(this.queryAll('thead tr:nth-child(1) td, thead tr:nth-child(1) th').length);
    this.queryAll('thead .labels .input').forEach(function (el, num) {
      inputs.push({
        label: el.textContent.trim(),
        choices: this.parseChoices(this.query('thead .values .input:nth-child(' + (num + 1) + ')')),
        // mappings: mappings,
        clauses: this.parseClauses(this.queryAll('tbody tr .input:nth-child(' + (num + 2) + ')'))
      });
    }, this);

    this.queryAll('thead .labels .output').forEach(function (el, num) {
      outputs.push({
        label: el.textContent.trim(),
        choices: this.parseChoices(this.query('thead .values .output:nth-child(' + (num + inputs.length + 1) + ')')),
        // mappings: mappings,
        clauses: this.parseClauses(this.queryAll('tbody tr .output:nth-child(' + (num + inputs.length + 2) + ')'))
      });
    }, this);

    this.name = this.query('h3').textContent.trim();
    this.inputs.reset(inputs);
    this.outputs.reset(outputs);
    return this.toJSON();
  },

  toJSON: function () {
    var json = View.prototype.toJSON.apply(this, arguments);
    delete json.el;
    return json;
  },

  render: function () {
    if (!this.el) {
      this.renderWithTemplate();
    }
    else {
      var parsed = 
      this.parseTable();
      console.info('parsed', parsed);
    }

    if (!this.headerEl) {
      this.cacheElements({
        headerEl: 'thead',
        bodyEl:   'tbody'
      });
    }

    // this.bodyEl.innerHTML = '';

    this.rowsView = this.renderCollection(this.rows, RowView, this.bodyEl);

    this.rows.reset([

    ]);

    return this.update();
  }
});

module.exports = DecisionTableView;