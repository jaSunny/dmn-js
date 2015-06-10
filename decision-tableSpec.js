'use strict';
/* global describe: false, it: false */

describe('Decision table', function () {
  describe('name');

  describe('input region', function () {
    describe('label', function () {
      it('can be edited');
    });

    describe('choices', function () {
      it('can be edited');

      it('can be a list of values');

      it('can be a data type');
    });

    describe('mapping', function () {
      it('can be edited');

      it('refers to a variable');
    });

    describe('rows', function () {
      describe('cell', function () {
        it('can be edited');

        describe('possible values', function () {
          describe('when choices are defined as a list', function () {
            it('must be one of the choices');
          });

          describe('when choices is a data type', function () {
            it('must be of the data type');
          });

          describe('when no choice is defined', function () {
            it('does not have restriction');
          });
        });
      });
    });
  });


  describe('output region', function () {
    describe('label', function () {
      it('can be edited');
    });

    describe('choices', function () {
      it('can be edited');

      it('can be a list of values');

      it('can be a data type');
    });

    describe('mapping', function () {
      it('can be edited');

      it('refers to a variable');
    });

    describe('rows', function () {
      describe('cell', function () {
        it('can be edited');

        describe('possible values', function () {
          describe('when choices are defined as a list', function () {
            it('must be one of the choices');
          });

          describe('when choices is a data type', function () {
            it('must be of the data type');
          });

          describe('when no choice is defined', function () {
            it('does not have restriction');
          });
        });
      });
    });
  });


  describe('placed in a element with limited height', function () {
    it('splits the table head and body');
  });
});
