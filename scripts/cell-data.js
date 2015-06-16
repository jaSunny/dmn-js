'use strict';
/*global module: false, deps: false*/

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');

var CellModel = State.extend({
  props: {
    value: 'string'
  },

  session: {
    focused: {
      type: 'boolean',
      default: false
    },

    editable: {
      type: 'boolean',
      default: true
    },
    
    choices: 'array'
  },

  initialize: function () {
    this.on('change:focused', function () {
      if (!this.focused) { return; }
      var cid = this.cid;
      var ruleCid = this.collection.parent.cid;
      var x = 0;
      var y = 0;
      var root = this.collection.parent.collection.parent;

      this.collection.parent.collection.forEach(function (rule, r) {
        rule.focused = rule.cid === ruleCid;
        if (rule.focused) { y = r; } 
        rule.cells.forEach(function (cell, c) {
          cell.focused = cell.cid === cid;
          if (cell.focused) { x = c; } 
        });
      });

      root.set({
        x: x,
        y: y
      });
    });
  }
});

module.exports = {
  Model: CellModel,
  Collection: Collection.extend({
    model: CellModel
  })
};