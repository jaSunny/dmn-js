'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');

var CellViews = require('./cell-view');

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

var RuleView = View.extend({
  template: '<tr><td class="number"></td></tr>',

  bindings: {
    'model.delta': {
      type: 'text',
      selector: '.number'
    },

    'model.focused': {
      type: 'booleanClass',
      name: 'focused'
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

  initialize: function () {
    var root = this.model.collection.parent;
    this.listenToAndRun(root.rules, 'reset', this.render);
    this.listenToAndRun(root.inputs, 'reset', this.render);
    this.listenToAndRun(root.outputs, 'reset', this.render);
  },

  render: function () {
    this.renderWithTemplate();

    var i;
    var subview;
    
    for (i = 0; i < this.inputs.length; i++) {
      subview = new CellViews.Input({
        //model:  this.model.inputCells[i],
        model:  this.model.cells.at(i),
        parent: this
      });
      
      this.registerSubview(subview.render());
      this.el.appendChild(subview.el);
    }

    for (i = 0; i < this.outputs.length; i++) {
      subview = new CellViews.Output({
        //model:  this.model.outputCells[i],
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

    // this.positionControls();

    return this;
  }
});

module.exports = RuleView;