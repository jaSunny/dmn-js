'use strict';
/* global require: false, module: false, console: false */
/* jshint debug: true */

require('./classList');


var DecisionTableView = require('./decision-table-view');
var ChoiceView = require('./choice-view');


module.exports = DecisionTableView;

function nodeListarray(els) {
  if (Array.isArray(els)) {
    return els;
  }
  var arr = [];
  for (var i = 0; i < els.length; i++) {
    arr.push(els[i]);
  }
  return arr;
}

function selectAll(selector, ctx) {
  ctx = ctx || document;
  return nodeListarray(ctx.querySelectorAll(selector));
}
window.selectAll = selectAll;


/*





function children(parent) {
  return nodeListarray(parent.childNodes)
          .filter(function (el) {
            return !!el.tagName;
          });
}

function mkEl(name, attributes,childEls) {
  var el = document.createElement(name);
  var keys = Object.keys(attributes || {});
  keys.forEach(function (key) {
    el.setAttribute(key, attributes[key]);
  });

  if (['string', 'number'].indexOf(typeof childEls) > -1) {
    el.textContent = childEls;
  }
  else {
    childEls = childEls ? nodeListarray(childEls) : [];
    childEls.forEach(function (child) {
      el.appendChild(child);
    });
  }
  
  return el;
}

function cellTable(cell) {
  for (var node = cell.parentNode; node.tagName.toLowerCase() !== 'table'; node = node.parentNode) {}
  return node;
}

function removeHoverClass(el) {
  el.classList.remove('hover');
}
function addHoverClass(el) {
  if (!el || !el.classList) { return; }
  el.classList.add('hover');
}

function elStyle(el) {
  return el.currentStyle || window.getComputedStyle(el);
}

function int(v) {
  return parseInt(v, 10);
}

function elBox(el, withMargin, withoutBorder) {
  var style = elStyle(el);

  return {
    top:    int(style.paddingTop) +
            (withMargin ? int(style.marginTop) : 0) +
            (withoutBorder ? 0 : int(style.borderTopWidth)),

    right:  int(style.paddingRight) +
            (withMargin ? int(style.marginRight) : 0) +
            (withoutBorder ? 0 : int(style.borderRightWidth)),

    bottom: int(style.paddingBottom) +
            (withMargin ? int(style.marginBottom) : 0) +
            (withoutBorder ? 0 : int(style.borderBottomWidth)),

    left:   int(style.paddingLeft) +
            (withMargin ? int(style.marginLeft) : 0) +
            (withoutBorder ? 0 : int(style.borderLeftWidth))
  };
}

function DropDownCell(el, choices) {
  this.el = el;
  this.el.classList.add('dropdown');
  this.choices = choices;
  this.render();
}

DropDownCell.prototype.render = function () {
  var cell = this.el;
  var wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  var val = mkEl('span', {class: 'value'}, this.el.textContent);
  val.addEventListener('click', function () {
    cell.classList.toggle('open');
  });

  var clear = this.clear = document.createElement('a');
  clear.classList.add('clear', 'icon-dmn');
  clear.addEventListener('click', function () {
    val.innerHTML = '';
    cell.classList.remove('open');
  });
  wrapper.appendChild(clear);

  wrapper.appendChild(val);

  var caret = this.caret = document.createElement('a');
  caret.classList.add('caret', 'icon-dmn');
  caret.addEventListener('click', function () {
    cell.classList.toggle('open');
  });
  wrapper.appendChild(caret);

  this.el.innerHTML = '';
  this.el.appendChild(wrapper);

  function makeChoice(label, clear) {
    var a = document.createElement('a');
    a.textContent = label;
    a.addEventListener('click', function (evt) {
      val.textContent = clear !== true ? a.textContent : '';
      cell.classList.remove('open');
      evt.preventDefault();
    });

    var choice = document.createElement('li');
    choice.appendChild(a);
    if (clear === true) {
      choice.classList.add('clear');
    }

    list.appendChild(choice);
  }

  var list = this.list = document.createElement('ul');
  this.choices.forEach(makeChoice, this);
  // makeChoice('clear', true);

  wrapper.appendChild(list);
  return this;
};

DropDownCell.prototype.close = function () {};

DropDownCell.prototype.value = function () {};






function DecisionTable(options) {
  if (!options || options.el) {
    throw new Error('Missing element to construct a DecisionTable');
  }
  var el = this.el = options.el;
  this.inputs = [];
  this.outputs = [];

  this.table = selectAll('table', this.el)[0];
  this.body = selectAll('tbody', this.table)[0];

  var index = 2;
  if (this.el.querySelector('thead .control')) {
    index = 3;
  }

  selectAll('thead tr.labels td.input', this.el).forEach(function (labelCell, delta) {
    var dataType;
    var choicesCell = this.el.querySelector('thead tr.values td:nth-child(' + (delta + 1) + ')');
    var choices = choicesCell.textContent.trim();

    // list of choices
    if (choices[0] === '(' && choices.slice(-1) === ')') {
      choices = choices
        .slice(1, -1)
        .split(',')
        .map(function (str) {
          return str.trim();
        })
        .filter(function (str) {
          return !!str;
        })
        ;
    }
    // data type
    else if (choices) {
      dataType = choices;
      choices = [];
    }




    var cellEls = selectAll('tbody tr td:nth-child(' + (delta + index) + ')', this.body);


    if (choices.length < 2) {
      cellEls.forEach(function (cell) {
        cell.contentEditable = true;
        cell.addEventListener('input', this.cellInput.bind(this));
      }, this);
    }

    else {
      cellEls.forEach(function (cell) {
        // new DropDownCell(cell, choices);
        new ChoiceView({
          el: cell,
          choices: choices
        });
      }, this);
    }
  }, this);

  this
    .splitBody()
    .bindEvents();
}



DecisionTable.prototype.splitBody = function () {
  var parent = this.el.parentNode;
  var parentBox = elBox(parent);
  var parentHeight = parent.clientHeight - (parentBox.top + parentBox.bottom);

  if (this.el.clientHeight <= parentHeight) {
    return this;
  }

  var el = this.el;
  var fullHeight = parentHeight;
  var div = document.createElement('div');

  this.table.classList.add('detached', 'dmn-table-head');
  this.table.removeChild(this.body);

  this.bodyTable = document.createElement('table');
  this.bodyTable.classList.add('detached', 'dmn-table-body');
  this.bodyTable.appendChild(this.body);

  div.classList.add('body-wrapper');
  el.classList.add('scrollable');
  el.style.height = fullHeight +'px';

  children(parent).forEach(function (child) {
    if (child === el) { return; }
    fullHeight -= (child.clientHeight + child.offsetTop);
  });

  div.style.height = (fullHeight - (this.table.clientHeight + this.table.offsetTop + 1)) +'px';
  div.appendChild(this.bodyTable);

  el.appendChild(div);

  return this;
};



DecisionTable.prototype.bindEvents = function () {
  selectAll([
    '.labels td',
    '.values td',
    '.mappings td',
    'tbody .input',
    'tbody .output',
    'tbody .annotation'
  ].join(', '), this.el).forEach(function (cell) {
    cell.addEventListener('focus', this.cellFocus.bind(this));
    cell.addEventListener('blur', this.cellBlur.bind(this));
  }, this);

  selectAll('tbody .input, tbody .output', this.el).forEach(function (col) {
    col.addEventListener('mouseover', this.tableColumnHover.bind(this));
  }, this);

  return this;
};


DecisionTable.prototype.tableColumnHover = function(evt) {
  var colNum = selectAll('td', evt.target.parentNode).indexOf(evt.target);
  var rows = selectAll('tbody tr', cellTable(evt.target));
  rows.forEach(function (row) {
    var tds = selectAll('td', row);
    tds.forEach(removeHoverClass);
    addHoverClass(tds[colNum]);
  });
};


DecisionTable.prototype.cellFocus = function (evt) {
  console.info('cellFocus', evt.target, evt.target.textContent);
};


DecisionTable.prototype.cellBlur = function (evt) {
  console.info('cellBlur', evt.target, evt.target.textContent);
};


DecisionTable.prototype.cellInput = function (evt) {
  console.info('cellInput', evt.target, evt.target.textContent);
};



module.exports = DecisionTable;

*/