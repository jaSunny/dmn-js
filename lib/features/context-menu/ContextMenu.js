'use strict';

var ids = new (require('diagram-js/lib/util/IdGenerator'))('table');

function ContextMenu(popupMenu, eventBus, modeling, elementRegistry, selection) {
  this._popupMenu = popupMenu;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
  this._selection = selection;

  var self = this;

  eventBus.on('element.contextmenu', function(evt) {
    // Do not open context menu on table footer
    if(!evt.element.row.isFoot) {
      evt.preventDefault();
      evt.gfx.firstChild.focus();
      self.open(evt.originalEvent.pageX, evt.originalEvent.pageY, evt.element);
    }
  });

  var preventFunction = function(evt) {
    evt.preventDefault();
  };
  eventBus.on('popupmenu.open', function(evt) {
    evt.container.addEventListener('contextmenu', preventFunction);
  });

  eventBus.on('popupmenu.close', function(evt) {
    evt.container.removeEventListener('contextmenu', preventFunction);
  });


  document.addEventListener('click', function(evt) {
    self.close();
  });

}

ContextMenu.$inject = [ 'popupMenu', 'eventBus', 'modeling', 'elementRegistry', 'selection' ];

module.exports = ContextMenu;

ContextMenu.prototype.getRuleActions = function(context) {
  return { id: 'rule', content: {label: 'Rule', linkClass: 'disabled', entries: [
          {id: 'ruleAdd', action: this.ruleAddAction.bind(this, context),
           content: {label: 'add', icon: 'plus', entries: [
            {id: 'ruleAddAbove', content: {label: '', icon: 'above'},
            action: this.ruleAddAction.bind(this, context, 'above')},
            {id: 'ruleAddBelow', content: {label: '', icon: 'below'},
            action: this.ruleAddAction.bind(this, context, 'below')}
          ]}},
          {id: 'ruleRemove', content: {label: 'remove', icon: 'minus'},
            action: this.ruleRemoveAction.bind(this, context)},
          {id: 'ruleClear', content: {label: 'clear', icon: 'clear'},
            action: this.ruleClearAction.bind(this, context)}
        ]}};
};

var isLastColumn = function(column) {
  var type = column.businessObject.inputEntry ? 'inputEntry' : 'outputEntry';

  // return false when the previous or the next column is of the same type
  return !(column.next.businessObject     && column.next.businessObject[type] ||
           column.previous.businessObject && column.previous.businessObject[type]);
},
noop = function(){};


ContextMenu.prototype.getInputActions = function(context) {
  var lastColumn = isLastColumn(context.column);
  return { id: 'clause', content: {label: 'Input', linkClass: 'disabled', icon:'input', entries: [
          {id: 'clauseAdd', action: this.clauseAddAction.bind(this, context),
           content: {label: 'add', icon:'plus', entries: [
            {id: 'clauseAddLeft', content: {label: '', icon: 'left'},
            action: this.clauseAddAction.bind(this, context, 'left')},
            {id: 'clauseAddRight', content: {label: '', icon: 'right'},
            action: this.clauseAddAction.bind(this, context, 'right')}
          ]}},
          {id: 'clauseRemove', content: {label: 'remove', icon: 'minus', linkClass: lastColumn ? 'disabled' : ''},
            action: lastColumn ? noop : this.clauseRemoveAction.bind(this, context)}
        ]}};
};

ContextMenu.prototype.getOutputActions = function(context) {
  var lastColumn = isLastColumn(context.column);
  return { id: 'clause', content: {label: 'Output', linkClass: 'disabled', icon:'output', entries: [
          {id: 'clauseAdd', action: this.clauseAddAction.bind(this, context),
           content: {label: 'add', icon:'plus', entries: [
            {id: 'clauseAddLeft', content: {label: '', icon: 'left'},
            action: this.clauseAddAction.bind(this, context, 'left')},
            {id: 'clauseAddRight', content: {label: '', icon: 'right'},
            action: this.clauseAddAction.bind(this, context, 'right')}
          ]}},
          {id: 'clauseRemove', content: {label: 'remove', icon: 'minus', linkClass: lastColumn ? 'disabled' : ''},
            action: lastColumn ? noop : this.clauseRemoveAction.bind(this, context)}
        ]}};
};

ContextMenu.prototype.getActions = function(context) {
  var out = [];
  if(context.row.businessObject &&
    !context.row.businessObject.$instanceOf('dmn:DecisionTable')) {
    out.push(this.getRuleActions(context));
  }
  if(context.column.id !== 'utilityColumn' &&
     context.column.id !== 'annotations' &&
    !context.row.isLabelRow) {
    if(context.column.businessObject.inputExpression) {
      out.push(this.getInputActions(context));
    } else {
      out.push(this.getOutputActions(context));
    }
  }
  return out;
};

ContextMenu.prototype.open = function(x, y, context) {
  var actions = this.getActions(context);
  if(actions.length > 0) {
    this._popupMenu.open(
      {
        position: { x: x, y: y },
        entries: actions
      }
    );
  }
};

ContextMenu.prototype.close = function() {
  this._popupMenu.close();
};

ContextMenu.prototype.clauseRemoveAction = function(context) {
  this._modeling.deleteColumn(context.column);
  this.close();
};

ContextMenu.prototype.clauseAddAction = function(context, position) {
  var type = context.column.businessObject.inputEntry ? 'inputEntry' : 'outputEntry';
  var col = context.column;
  if(position === 'left') {
    col = col.previous;
  } else if (position !== 'right') {
    while(col.next && col.next.businessObject[type]) {
      col = col.next;
    }
  }

  var newColumn = {
    id: ids.next(),
    previous: col,
    name: '',
    isInput: type === 'inputEntry'
  };

  this._modeling.createColumn(newColumn);
  this.close();
};

ContextMenu.prototype.ruleRemoveAction = function(context) {
  this._modeling.deleteRow(context.row);
  this.close();
};

ContextMenu.prototype.ruleAddAction = function(context, position) {
  var newRow = {id: ids.next()};
  if(position === 'above') {
    newRow.next = context.row;
  } else if(position === 'below') {
    newRow.previous = context.row;
  }
  this._modeling.createRow(newRow);
  this.close();
};

ContextMenu.prototype.ruleClearAction = function(context) {
  this._modeling.clearRow(context.row);
  this.close();
};
