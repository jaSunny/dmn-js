'use strict';
/* global module: false, deps: false, require: false */

var View = deps('ampersand-view');
var Collection = deps('ampersand-collection');
var State = deps('ampersand-state');
var ComboBoxView = require('./combobox-view');


function elBox(el) {
  var node = el;
  var box = {
    top: el.offsetTop,
    left: el.offsetLeft,
    width: el.offsetWidth,
    height: el.offsetHeight
  };

  while ((node = node.offsetParent)) {
    if (node.offsetTop) {
      box.top += parseInt(node.offsetTop, 10);
    }
    if (node.offsetLeft) {
      box.left += parseInt(node.offsetLeft, 10);
    }
  }

  return box;
}


var LanguagesCollection = Collection.extend({
  last: function () {
    return this.models[this.models.length - 1];
  },

  restripe: function () {
    var models = this.filter(function (model) {
      return model.value;
    });

    models.push({
      value: ''
    });

    this.reset(models);

    return this;
  },

  model: State.extend({
    props: {
      value: 'string'
    },

    initialize: function () {
      this.on('change:value', function () {
        this.collection.restripe();
      });
    }
  })
});








var LanguagesCollection = Collection.extend({
  mainIndex: 'value',
  model: State.extend({
    props: {
      value: 'string',
      placeholder: 'string'
    }
  })
});




var defaultLanguage = [
  {
    value: 'Javascript',
    placeholder: 'return obj.propertyName;'
  },
  {
    value: 'Groovy'
  },
  {
    value: 'Python'
  },
  {
    value: 'Ruby'
  }
];


var ClauseExpressionView = View.extend({
  template: '<div class="dmn-clauseexpression-setter">' +
              '<div class="links">' +
                '<div class="toggle-type">' +
                  '<a class="expression">Expression</a>' +
                  '<a class="script">Script</a>' +
                '</div>' +
                '<a class="icon-dmn icon-clear"></a>' +
              '</div>' +

              '<div class="expression region">' +
                '<label>Expression:</label>' +
                '<input placeholder="propertyName" />' +
              '</div>' +

              '<div class="script region">' +
                '<div class="language"></div>' +
                '<textarea></textarea>' +
              '</div>' +
            '</div>',

  subviews: {
    languageView: {
      container: '.language',
      prepareView: function (el) {
        var comboboxView = new ComboBoxView({
          parent:     this,
          collection: this.languages,
          value:      this.language,
          label:      'Language:',
          className:  el.className
        });

        var cbEl = comboboxView.render().el;
        el.parentNode.replaceChild(cbEl, el);

        this.listenTo(comboboxView, 'change:value', function () {
          if (this.model.mappingType !== 'script') { return; }

          this.model.language = comboboxView.value;
          var info = this.languages.get(this.model.language);

          if (!info) { return; }
          this.placeholder = info.placeholder || '';
        });

        this.on('change:visible', function () {
          if (this.visible) {
            comboboxView.setVisible();
          }
          else {
            comboboxView.suggestionsEl.style.display = 'none';
          }
        });

        return comboboxView;
      }
    }
  },

  collections: {
    languages: LanguagesCollection,
    possibleLanguages: LanguagesCollection
  },

  session: {
    visible:      'boolean',
    placeholder:  'string',
    originalBox:  'any',
    invalid:      'boolean'
  },

  derived: {
    contextMenu: {
      cache: false,
      fn: function () {
        var current = this;
        while ((current = current.parent)) {
          if (current.contextMenu) {
            return current.contextMenu;
          }
        }
      }
    },
    tableView: {
      dep: ['parent'],
      cache: false,
      fn: function () {
        var parent = this.parent;
        while ((parent = parent.parent)) {
          if (parent.tableEl instanceof Element) {
            return parent;
          }
        }
      }
    }
  },

  bindings: {
    visible: {
      type: 'toggle'
    },

    placeholder: {
      type: 'attribute',
      selector: 'textarea',
      name: 'placeholder'
    },

    'model.source': {
      type: 'value',
      selector: '.script textarea'
    },

    'model.expression': {
      type: 'value',
      selector: '.expression input'
    },

    'model.mappingType': {
      type: function () {
        this.setPosition();
      }
    }
  },

  events: {
    'keyup .expression input':    '_handleExpressionChange',
    'keyup .script textarea':     '_handleScriptChange',
    'click .toggle-type a':       '_handleScriptToggleClick',
    'click .icon-clear':          '_handleClearClick'
  },

  _handleExpressionChange: function () {
    try {
      this.model.expression = this.expressionEl.value;
      if (this.parent.error) {
        this.parent.error = false;
      }
    }
    catch (err) {
      this.parent.error = err.message;
    }
  },

  _handleScriptChange: function (evt) {
    this.model.source = evt.target.value;
  },

  _handleScriptToggleClick: function (evt) {
    this.model.mappingType = evt.target.className;
  },

  _handleClearClick: function () {
    this.hide();
  },

  setPosition: function () {
    if (!this.parent || !this.parent.el) {
      this.visible = false;
      return;
    }
    var box;
    var style = this.el.style;

    // initial or expression
    if (this.model.mappingType !== 'script') {
      this.el.classList.remove('use-script');

      style.visibility = 'hidden';
      style.display = 'block';
      style.width = 'auto';

      this.originalBox = elBox(this.el);
      box = elBox(this.parent.el);

      box.top -= this.el.clientHeight;

      box.left += Math.min(document.body.clientWidth - (box.left + this.el.clientWidth), 0);
      box.top += Math.min(document.body.clientHeight - (box.top + this.el.clientHeight), 0);

      style.top = box.top +'px';
      style.left = box.left +'px';
      style.visibility = null;
    }

    // script
    else {
      if (this.languageView) {
        this.languageView.setPosition();
      }
      this.el.classList.add('use-script');

      box = elBox(this.tableView.el);
      style.top = box.top + 'px';
      style.left = box.left + 'px';
      style.width = box.width + 'px';
    }

    return this;
  },

  show: function (model, parent) {
    if (!model) {
      return;
    }

    if (parent && this.parent !== parent) {
      this.parent = parent;
    }

    if (this.model !== model) {
      this.model = model;
    }

    this.languages.reset(defaultLanguage);

    instance.visible = true;
    if (this.parent) {
      if (this.parent.contextMenu) {
        this.parent.contextMenu.close();
      }
      if (this.parent.clauseValuesEditor) {
        this.parent.clauseValuesEditor.hide();
      }
    }

    this.setPosition();

    return this;
  },

  hide: function () {
    this.visible = false;
    return this;
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      expressionEl: '.expression input',
      languageEl:   '.language',
      sourceEl:     '.script textarea'
    });

    return this;
  }
});



var instance;
ClauseExpressionView.instance = function (suggestions, parent) {
  if (!instance) {
    instance = new ClauseExpressionView({});
    instance.render();
  }

  if (!document.body.contains(instance.el)) {
    document.body.appendChild(instance.el);
  }

  instance.show(suggestions, parent);

  return instance;
};


if (typeof window !== 'undefined') {
  window.dmnClauseExpressionEditor = ClauseExpressionView.instance();
}

ClauseExpressionView.Collection = LanguagesCollection;

module.exports = ClauseExpressionView;
