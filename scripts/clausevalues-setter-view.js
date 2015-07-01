'use strict';
/* global module: false, deps: false */

var View = deps('ampersand-view');
var Collection = deps('ampersand-collection');
var State = deps('ampersand-state');





var ValuesCollection = Collection.extend({
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

var ValuesItemView = View.extend({
  template: '<li><input /></li>',

  session: {
    invalid: 'boolean'
  },

  bindings: {
    'model.value': {
      type: 'value',
      selector: 'input'
    },
    invalid: {
      type: 'booleanClass',
      name: 'invalid',
      selector: 'input'
    }
  },

  events: {
    'change input':   '_handleValueChange',
    'blur input':     '_handleValueChange',
    //'keypress input': '_handleValueChange',
    'keyup input':    '_handleValueKeyup'
  },

  _handleValueChange: function (evt) {
    if (this.model.value !== evt.target.value) {
      this.model.value = evt.target.value;
    }

    this.validate();
  },

  _handleValueKeyup: function (evt) {
    var collection = this.model.collection;
    var last = collection.last();

    if (last === this.model && evt.target.value) {
      collection.add({value: ''});
    }
  },

  validate: function () {
    var val = this.model.value;
    if (!val) {
      this.invalid = false;
      return this;
    }

    var cid = this.model.cid;
    var same = this.model.collection.filter(function (other) {
      return other.cid !== cid && other.value === val;
    });

    this.invalid = same.length > 0;

    return this;
  }
});







var DatatypesCollection = Collection.extend({
  mainIndex: 'value',
  model: State.extend({
    props: {
      value: 'string'
    }
  })
});

var DatatypeOptionView = View.extend({
  template: '<option></option>',

  bindings: {
    'model.value': [
      {
        type: 'text'
      },
      {
        type: 'attribute',
        name: 'value'
      }
    ]
  }
});







var primitiveTypes = [
  'string',
  'date',

  // https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html
  'short',
  'int',
  'long',
  'float',
  'double',
  'boolean'
].map(function (val) {
  return { value: val };
});

var ClauseValuesView = View.extend({
  template: '<div class="dmn-clausevalues-setter">' +
              '<div class="datatype">' +
                '<label>Data type:</label>' +
                '<select></select>' +
              '</div>' +
              '<div class="allowed-values">' +
                '<label>Allowed values:</label>' +
                '<ul></ul>' +
              '</div>' +
            '</div>',

  collections: {
    datatypes: DatatypesCollection,
    possibleValues: ValuesCollection
  },

  session: {
    visible: 'boolean',
    datatype: {type: 'string', default: 'string'}
  },

  bindings: {
    visible: {
      type: 'toggle'
    }
  },

  events: {
    'change select': '_handleDatatypeChange'
  },

  _handleDatatypeChange: function () {
    this.datatype = this.datatypeEl.value;
  },

  initialize: function () {
    var self = this;

    function hasModel() {
      return self.parent && self.parent.model && self.parent.model.datatype;
    }

    this.on('change:datatype', function () {
      if (!hasModel()) { return; }

      this.parent.model.datatype = this.datatype;
    });

    this.listenTo(this.possibleValues, 'all', function () {
      if (!hasModel()) { return; }

      this.parent.model.choices = this.possibleValues
                                  .filter(function (item) {
                                    return item.value;
                                  }).map(function (item) {
                                    return item.value;
                                  });
    });
  },

  setPosition: function () {
    if (!this.parent || !this.parent.el) {
      this.visible = false;
      return;
    }

    var node = this.parent.el;
    var top = node.offsetTop;
    var left = node.offsetLeft;
    var helper = this.el;

    while ((node = node.offsetParent)) {
      if (node.offsetTop) {
        top += parseInt(node.offsetTop, 10);
      }
      if (node.offsetLeft) {
        left += parseInt(node.offsetLeft, 10);
      }
    }

    left += this.parent.el.clientWidth;
    top -= 40;
    helper.style.top = top;
    helper.style.left = left;
  },

  show: function (datatype, values, parent) {
    if (parent && this.parent !== parent) {
      this.parent = parent;
    }

    this.datatypes.reset(primitiveTypes);
    this.datatypeEl.value = datatype;

    values = values || [];
    var vals = Array.isArray(values) ? values.map(function (val) { return {value: val}; }) : values.toJSON();
    vals = vals.filter(function (item) { return item.value; });
    vals.push({ value: '' });

    this.possibleValues.reset(vals);

    instance.visible = true;
    if (instance.visible) {
      this.setPosition();
    }

    return this;
  },

  hide: function () {
    this.visible = false;
    return this;
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      datatypeEl: 'select',
      valuesEl: 'ul'
    });

    this.query('.datatype label').setAttribute('for', this.cid + '-datatype');
    this.datatypeEl.setAttribute('id', this.cid + '-datatype');

    this.renderCollection(this.datatypes, DatatypeOptionView, this.datatypeEl);
    this.renderCollection(this.possibleValues, ValuesItemView, this.valuesEl);

    this.listenTo(this.possibleValues, 'change', function () {
      this.trigger('change');
    });

    return this;
  }
});



var instance;
ClauseValuesView.instance = function (suggestions, parent) {
  if (!instance) {
    instance = new ClauseValuesView({});
    instance.render();
  }

  if (!document.body.contains(instance.el)) {
    document.body.appendChild(instance.el);
  }

  instance.show(suggestions, parent);

  return instance;
};


ClauseValuesView.Collection = ValuesCollection;

module.exports = ClauseValuesView;
