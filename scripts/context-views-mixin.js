'use strict';
/*global module: false*/

var mixins = module.exports = {};

[
  'clauseValuesEditor',
  'clauseExpressionEditor',
  'contextMenu'
].forEach(function (name) {
  mixins[name] = {
    cache: false,
    fn: function () {
      var current = this;
      while ((current = current.parent)) {
        if (current[name]) {
          return current[name];
        }
      }
    }
  };
});
