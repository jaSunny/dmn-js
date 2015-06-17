'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var ChoiceView = require('./choice-view');



var LabelView = View.extend(merge({/*}, ChoiceView.prototype, {*/
  render: function () {
    this.el.textContent = (this.model.label || '').trim();
  }
}));




var MappingView = View.extend(merge({/*}, ChoiceView.prototype, {*/
  render: function () {
    this.el.textContent = (this.model.mapping || '').trim();
  }
}));




var ValueView = View.extend(merge({/*}, ChoiceView.prototype, {*/
  render: function () {
    var str = '';
    if (this.model.choices && this.model.choices.length) {
      str = '(' + this.model.choices.join(', ') + ')';
    }
    else {
      str = 'TODO: datatype';
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
