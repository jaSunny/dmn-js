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
              '<div class="expression region">' +
                '<div class="row link">' +
                  '<a class="toggle-script use-script">Use script</a>' +
                  '<span class="icon-dmn icon-clear"></span>' +
                '</div>' +

                '<div class="row fields">' +
                  '<label>Expression:</label>' +
                  '<input placeholder="${propertyName}" />' +
                '</div>' +
              '</div>' +

              '<div class="script region">' +
                '<div class="row link">' +
                  '<a class="toggle-script use-expression">Use expression</a>' +
                  '<span class="icon-dmn icon-clear"></span>' +
                '</div>' +

                '<div class="row fields">' +
                  '<div class="language"></div>' +
                  '<textarea></textarea>' +
                '</div>' +
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
    big:          'boolean',
    placeholder:  'string',
    originalBox:  'any'
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
    }
  },

  events: {
    'keyup .expression input':    '_handleExpressionChange',
    'keyup .script textarea':     '_handleScriptChange',
    'click .toggle-script':       '_handleScriptToggleClick',
    'click .icon-clear':          '_handleClearClick'
  },

  _handleExpressionChange: function () {
    this.model.expression = this.expressionEl.value;
  },

  _handleScriptChange: function (evt) {
    this.model.source = evt.target.value;
  },

  _handleScriptToggleClick: function (evt) {
    if (evt.target.className.indexOf('use-script') > -1) {
      this.model.mappingType = 'script';
      this.big = true;
    }
    else {
      this.model.mappingType = 'expression';
      this.big = false;
    }
  },

  _handleClearClick: function () {
    this.hide();
  },

  initialize: function () {
    this.on('change:big', function () {
      var style = this.el.style;
      var box;

      if (this.big) {
        this.el.classList.add('big');

        box = elBox(this.tableView.el);

        style.width = box.width +'px';
        style.height = box.height +'px';
      }
      else {
        this.el.classList.remove('big');

        box = this.originalBox;

        style.width = 'auto';
        style.height = 'auto';
      }

      if (box) {
        this._resizeTextarea(box);
        style.top = box.top +'px';
        style.left = box.left +'px';
      }
    });
  },

  setPosition: function () {
    if (!this.parent || !this.parent.el) {
      this.visible = false;
      return;
    }

    this.originalBox = elBox(this.el);

    var box = elBox(this.parent.el);

    box.top -= this.el.clientHeight;

    box.left += Math.min(document.body.clientWidth - (box.left + this.el.clientWidth), 0);
    box.top += Math.min(document.body.clientHeight - (box.top + this.el.clientHeight), 0);

    this.el.style.top = box.top +'px';
    this.el.style.left = box.left +'px';

    if (this.languageView) {
      this.languageView.setPosition();
    }
  },

  _resizeTextarea: function (box) {
    var labelHeight = this.sourceEl.parentNode.clientHeight - this.sourceEl.clientHeight;
    this.sourceEl.style.height = (box.height - (this.languageEl.clientHeight + labelHeight)) + 'px';
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
    this.big = false;
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
