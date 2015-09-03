'use strict';

var domClasses = require('min-dom/lib/classes');
/**
 *  The controls module adds a container to the top-right corner of the table which holds
 *  some control elements
 */
function HideTechControl(eventBus, sheet) {

  eventBus.on('controls.init', function(evt) {

    evt.controls.addControl('Hide mappings', function(evt) {
      console.log('clicked the hide mappings button', sheet);
      domClasses(sheet.getContainer().parentNode).add('hide-mappings');
    });

  });

}

HideTechControl.$inject = [ 'eventBus', 'sheet' ];

module.exports = HideTechControl;
