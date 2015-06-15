'use strict';
/* global require: false, module: false */

var State = require('ampersand-state');
var Collection = require('ampersand-collection');
var View = require('ampersand-view');

var specialKeys = [
  8 // backspace
];

var ChoicesCollection = Collection.extend({
  model: State.extend({
    props: {
      value: 'string',
      html: 'string'
    }
  })
});

var ChoiceSuggestionView = View.extend({
  template: '<li></li>',

  bindings: {
    'model.html': {
      type: 'innerHTML'
    }
  },

  events: {
    click: '_handleClick'
  },

  _handleClick: function () {
    if (!this.parent) { return; }
    this.parent.value = this.model.value;
    if (this.parent.value === this.model.value) { 
      this.parent.trigger('change:value');
    }
  }
});

var ChoiceView = View.extend({
  collections: {
    choices: ChoicesCollection
  },

  events: {
    input: '_handleInput',
    focus: '_handleFocus',
    click: '_handleFocus',
    blur:  '_handleBlur'
  },

  props: {
    value: 'string'
  },

  bindings: {
    value: {
      type: function (el, value) {
        if (!value || !value.trim()) { return; }
        this.el.textContent = value.trim();
      }
    }
  },

  initialize: function (options) {
    options = options || {};

    this.el.contentEditable = true;
    this.value = this.el.textContent.trim();
    
    var choices = options.choices || [];
    this.choices.reset(choices.map(function (choice) {
      return {value: choice};
    }));

    this.suggestions = new ChoicesCollection({
      parent: this.choices
    });
    
    var suggestionsEl = this.suggestionsEl = document.createElement('ul');
    suggestionsEl.className = 'dmn-suggestions-helper';

    document.body.appendChild(suggestionsEl);
    
    function resetSuggestions() {
      this.suggestions.reset(this._filter(this.value));
    }
    this.on('change:value', resetSuggestions.bind(this));

    this.renderCollection(this.suggestions, ChoiceSuggestionView, suggestionsEl);

    this.listenToAndRun(this.choices, 'change', resetSuggestions.bind(this));

    this.listenToAndRun(this.suggestions, 'reset', function () {
      this.suggestionsEl.style.display = this.suggestions.length < 2 ? 'none' : 'block';
    });

    var self = this;
    function _handleResize() {
      self._handleResize();
    }
    this._handleResize();
    window.addEventListener('resize', _handleResize);
  },

  remove: function () {
    window.removeEventListener();
    document.body.removeChild(this.suggestionsEl);
    View.prototype.remove.apply(this, arguments);
  },

  _filter: function (val) {
    if (!val) { return []; }
    var filtered = this.choices
          .filter(function (choice) {
            return choice.value.indexOf(val) === 0;
          })
          .map(function (choice) {
            var chars = this.el.textContent.length;
            var val = choice.escape('value');
            var htmlStr = '<span class="highlighted">' + val.slice(0, chars) + '</span>';
            htmlStr += val.slice(chars);
            return {
              value: choice.value,
              html: htmlStr
            };
          }, this);
    return filtered;
  },

  _handleFocus: function () {
    // this.el.setSelectionRange(0, this.el.textContent.length);
    this._handleInput();
  },

  _handleBlur: function () {
    // this.suggestionsEl.style.display = 'none';
  },

  _handleResize: function () {
    var node = this.el;
    var top = node.offsetTop;
    var left = node.offsetLeft;
    var helper = this.suggestionsEl;

    while ((node = node.offsetParent)) {
      if (node.offsetTop) {
        top += parseInt(node.offsetTop, 10);
      }
      if (node.offsetLeft) {
        left += parseInt(node.offsetLeft, 10);
      }
    }

    top -= helper.clientHeight;
    helper.style.top = top;
    helper.style.left = left;
  },

  _handleInput: function (evt) {
    if (evt && (specialKeys.indexOf(evt.keyCode) > -1 || evt.ctrlKey)) {
      return;
    }
    var val = this.el.textContent;

    var filtered = this._filter(val);
    this.suggestions.reset(filtered);
    this._handleResize();

    if (filtered.length === 1) {
      if (evt) {
        evt.preventDefault();
      }
      
      var matching = filtered[0].value;
      this.set({
        value: matching
      }, {
        silent: true
      });
      this.el.textContent = matching;
    }
  }
});

module.exports = ChoiceView;