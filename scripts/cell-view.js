'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');


var ChoiceView = require('./choice-view');
var RuleCellView = View.extend(merge(ChoiceView.prototype, {
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



var RuleInputCellView = RuleCellView.extend({
  bindings: merge({}, RuleCellView.prototype.bindings, {
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




var RuleOutputCellView = RuleCellView.extend({
  template: '<td class="output"></td>'
});





var RuleAnnotationCellView = RuleCellView.extend({
  template: '<td class="annotation"></td>'
});



module.exports = {
  Cell:       RuleCellView,
  Input:      RuleInputCellView,
  Output:     RuleOutputCellView,
  Annotation: RuleAnnotationCellView
};