'use strict';
/* global deps: false, module: false */

var State = deps('ampersand-state');
var Collection = deps('ampersand-collection');
var View = deps('ampersand-view');

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
    this.parent.model.value = this.model.value;
    if (this.parent.model.value === this.model.value) { 
      this.parent.model.trigger('change:value');
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
    blur:  '_handleBlur'
  },
  
  session: {
    valid:          {
      default: true,
      type: 'boolean'
    },
    
    originalValue:  'string'
  },

  derived: {
    isOriginal: {
      deps: ['model.value', 'originalValue'],
      fn: function () {
        return this.model.value === this.originalValue;
      }
    }
  },

  bindings: {
    'model.value': {
      type: function (el, value) {
        if (!value || !value.trim()) { return; }
        this.el.textContent = value.trim();
      }
    },

    'model.focused': {
      type: 'booleanClass',
      name: 'focused'
    },

    isOriginal: {
      type: 'booleanClass',
      name: 'untouched'
    }
  },

  initialize: function (options) {
    options = options || {};
    if (this.el) {
      this.el.contentEditable = true;
      this.originalValue = this.value = this.el.textContent.trim();
    }
    else {
      this.originalValue = this.value;
    }


    var choices = this.model.choices;
    if (!choices || !choices.length) {
      choices = options.choices || [];
    }

    this.choices.reset(choices.map(function (choice) {
      return {value: choice};
    }));

    this.suggestions = new ChoicesCollection({
      parent: this.choices
    });
    
    var suggestionsEl = this.suggestionsEl = document.createElement('ul');
    suggestionsEl.className = 'dmn-suggestions-helper';

    document.body.appendChild(suggestionsEl);
    
    var self = this;

    function resetSuggestions() {
      self.suggestions.reset(self._filter(self.value));
    }
    this.listenToAndRun(this.model, 'change:value', resetSuggestions);

    this.renderCollection(this.suggestions, ChoiceSuggestionView, suggestionsEl);

    this.listenToAndRun(this.choices, 'change', resetSuggestions);

    this.listenToAndRun(this.suggestions, 'reset', function () {
      this.suggestionsEl.style.display = this.suggestions.length < 2 ? 'none' : 'block';
    });


    function _handleResize() {
      self._handleResize();
    }
    if (!this.el) {
      this.once('change:el', _handleResize);
    }
    window.addEventListener('resize', _handleResize);
    this._handleResize();
  },

  remove: function () {
    window.removeEventListener();
    document.body.removeChild(this.suggestionsEl);
    View.prototype.remove.apply(this, arguments);
  },

  _filter: function (val) {
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
    this._handleInput();
    this.model.focused = true;
  },

  _handleBlur: function () {
    // this.model.focused = false;
  },

  _handleResize: function () {
    if (!this.el) { return; }
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
      this.model.set({
        value: matching
      }, {
        silent: true
      });
      this.el.textContent = matching;
    }
  }
});

module.exports = ChoiceView;