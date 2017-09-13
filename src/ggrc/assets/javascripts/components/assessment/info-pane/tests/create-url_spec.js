/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.createUrl', function () {
  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('createUrl');
  });

  describe('create() method', function () {
    var document;
    var saveDfd;

    beforeEach(function () {
      saveDfd = can.Deferred();
      document = {
        save: jasmine.createSpy('save').and.returnValue(saveDfd)
      };
      viewModel.attr('value', 'Important data');
      spyOn(CMS.Models, 'Document').and.returnValue(document);
    });

    it('shows error if value field is empty string or was not set',
    function () {
      spyOn(GGRC.Errors, 'notifier');
      viewModel.attr('value', null);
      viewModel.create();
      expect(GGRC.Errors.notifier).toHaveBeenCalled();
    });

    it('dispatches "beforeCreate" event for VM with items', function () {
      spyOn(viewModel, 'dispatch');
      viewModel.create();
      expect(viewModel.dispatch).toHaveBeenCalledWith({
        type: 'beforeCreate',
        items: [document]
      });
    });

    it('saves created document', function () {
      viewModel.create();
      expect(document.save).toHaveBeenCalled();
    });

    describe('creates document namely', function () {
      var getFirstParam;

      beforeAll(function () {
        getFirstParam = function (spy) {
          return spy.calls.argsFor(0)[0];
        };
      });

      beforeEach(function () {
        jasmine.clock().install();
      });

      beforeEach(function () {
        jasmine.clock().uninstall();
      });

      it('sets link to value field value', function () {
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).link
        ).toBe(viewModel.attr('value'));
      });

      it('sets title to value field value', function () {
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).title
        ).toBe(viewModel.attr('value'));
      });

      it('sets context to context field value if it exists', function () {
        viewModel.attr('context', {});
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).context
        ).toBe(viewModel.attr('context'));
      });

      it('sets context to sets context to CMS.Models.Contexts instance ' +
      'with id = null if context does not exist', function () {
        var result = new CMS.Models.Context({id: null}).serialize();
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).context.serialize()
        ).toEqual(result);
      });

      it('sets document_type to type field value', function () {
        viewModel.attr('type', {});
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).document_type
        ).toBe(viewModel.attr('type'));
      });

      it('sets created_at to current time', function () {
        var date = new Date();
        jasmine.clock().mockDate(date);
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).created_at
        ).toEqual(date);
      });

      it('sets isDraft to true', function () {
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document).isDraft
        ).toBe(true);
      });

      it('sets _stamp to current time in milliseconds', function () {
        var date = new Date();
        jasmine.clock().mockDate(date);
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Document)._stamp
        ).toBe(date.getTime());
      });
    });

    describe('when save operation was resolved', function () {
      it('dispatches "created" event for VM with item equals to response ' +
      'value after save', function () {
        var data = {};

        spyOn(viewModel, 'dispatch');
        saveDfd.resolve(data);
        viewModel.create();

        expect(viewModel.dispatch).toHaveBeenCalledWith({
          type: 'created',
          item: data
        });
      });

      it('calls clear method', function () {
        spyOn(viewModel, 'clear');
        saveDfd.resolve();
        viewModel.create();
        expect(viewModel.clear).toHaveBeenCalled();
      });
    });

    describe('when save operation was rejected', function () {
      it('shows error', function () {
        spyOn(GGRC.Errors, 'notifier');

        saveDfd.reject();
        viewModel.create();

        expect(GGRC.Errors.notifier).toHaveBeenCalledWith(
          'error',
          'Unable to create URL.'
        );
      });
    });
  });

  describe('clear() method', function () {
    it('sets value field to null', function () {
      viewModel.attr('value', 1);
      viewModel.clear();
      expect(viewModel.attr('value')).toBeNull();
    });
  });
});
