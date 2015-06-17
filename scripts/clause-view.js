'use strict';
/* global require: false, module: false, deps: false */

var View = deps('ampersand-view');
var merge = deps('lodash.merge');
var ChoiceView = require('./choice-view');



var NameView = View.extend(merge({}, ChoiceView.prototype, {

}));




var MappingView = View.extend(merge({}, ChoiceView.prototype, {

}));




var ValueView = View.extend(merge({}, ChoiceView.prototype, {

}));





var requiredElement = {
  type: 'element',
  required: true
};

var ClauseView = View.extend({
  session: {
    nameEl:     requiredElement,
    mappingEl:  requiredElement,
    valueEl:    requiredElement
  },

  initialize: function () {
    var subviews = {
      name:     NameView,
      mapping:  MappingView,
      value:    ValueView
    };

    Object.keys(subviews).forEach(function (name) {
      this.on('change:' + name, function () {
        if (this[name + 'View']) { this.stopListening(this[name + 'View']); }

        this[name + 'View'] = new subviews[name]({
          parent: this,
          el: this[name + 'El']
        });
      });
    }, this);
  }
});




module.exports = ClauseView;
