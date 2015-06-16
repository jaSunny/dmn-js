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

      var clauseCid = this.collection.parent.cid;
      this.collection.parent.collection.forEach(function (clause) {
        clause.focused = clause.cid === clauseCid;
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