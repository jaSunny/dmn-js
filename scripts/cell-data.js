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

      var ruleCid = this.collection.parent.cid;
      this.collection.parent.collection.forEach(function (rule) {
        rule.focused = rule.cid === ruleCid;
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