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
    value: 'FEEL'
  },
  {
    value: 'LUA'
  },
  {
    value: 'COBOL'
  },
  {
    value: 'PHP',
    placeholder: 'return $obj[\'propertyName\'];'
  },
  {
    value: 'LISP'
  },
  {
    value: 'Scala'
  },
  {
    value: 'C'
  },
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
    value: 'Perl'
  }
];


var ClauseExpressionView = View.extend({
  template: '<div class="dmn-clauseexpression-setter">' +
              '<div class="language"></div>' +

              '<div class="source">' +
                '<label>Source:</label>' +
                '<textarea></textarea>' +
                '<span class="toggle-editor-size"></span>' +
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
          this.language = comboboxView.value;
          var info = this.languages.get(this.language);
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
    language:     {type: 'string', default: 'FEEL'},
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
    }
  },

  events: {
    'change select':              '_handleLanguageChange',
    'input textarea':             '_handleSourceInput',
    'click .toggle-editor-size':  '_handleSizeClick'
  },

  _handleLanguageChange: function () {
    this.language = this.languageEl.value;
  },

  _handleSourceInput: function () {

  },

  _handleSizeClick: function () {
    this.big = !this.big;
  },

  initialize: function () {
    var self = this;

    function hasModel() {
      return self.parent && self.parent.model && self.parent.model.language;
    }

    this.on('change:language', function () {
      if (!hasModel()) { return; }

      this.parent.model.language = this.language;
    });

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

      this._resizeTextarea(box);

      style.top = box.top +'px';
      style.left = box.left +'px';
    });
  },

  setPosition: function () {
    if (!this.parent || !this.parent.el) {
      this.visible = false;
      return;
    }

    var helper = this.el;
    var box = elBox(this.parent.el);

    box.left += this.parent.el.clientWidth;
    box.top -= 20;

    box.left += Math.min(document.body.clientWidth - (box.left + this.el.clientWidth), 0);
    box.top += Math.min(document.body.clientHeight - (box.top + this.el.clientHeight), 0);

    helper.style.top = box.top +'px';
    helper.style.left = box.left +'px';

    if (this.languageView) {
      this.languageView.setPosition();
    }

    this.originalBox = elBox(this.el);
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
    this.model = model;

    this.languages.reset(defaultLanguage);

    this.languageView.inputEl.value = this.model.language || '';


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
      languageEl: '.language',
      sourceEl:   '.source textarea'
    });

    this.sourceEl.setAttribute('id', this.cid);
    this.query('.source label').setAttribute('for', this.cid);

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
