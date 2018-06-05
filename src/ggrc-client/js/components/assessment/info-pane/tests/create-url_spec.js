/*
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('create-url component', () => {
  let viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('createUrl');
  });

  describe('create() method', () => {
    let saveDfd;
    let evidence;

    beforeEach(function () {
      saveDfd = can.Deferred();
      evidence = {
        save: jasmine.createSpy('save').and.returnValue(saveDfd),
      };
      viewModel.attr('value', 'Important data');
      spyOn(CMS.Models, 'Evidence').and.returnValue(evidence);
      spyOn(CMS.Models, 'Context');
    });

    describe('shows error', () => {
      it('if value field was not set', function () {
        spyOn(GGRC.Errors, 'notifier');
        viewModel.attr('value', null);

        viewModel.create();

        expect(GGRC.Errors.notifier).toHaveBeenCalled();
      });

      it('if value field is empty', function () {
        spyOn(GGRC.Errors, 'notifier');
        viewModel.attr('value', '');

        viewModel.create();

        expect(GGRC.Errors.notifier).toHaveBeenCalled();
      });
    });

    it('dispatches "beforeCreate" event for VM with evidence item within ' +
    'array before saving it', function () {
      spyOn(viewModel, 'dispatch');

      viewModel.create();

      expect(viewModel.dispatch).toHaveBeenCalledWith({
        type: 'beforeCreate',
        items: [evidence],
      });
      expect(viewModel.dispatch).toHaveBeenCalledBefore(evidence.save);
    });

    describe('creates evidence, where', () => {
      let getFirstParam;

      beforeAll(function () {
        getFirstParam = (spy) => spy.calls.argsFor(0)[0];
      });

      it('link equals to viewModel.value', function () {
        const value = 'SomeValue';
        viewModel.attr('value', value);

        viewModel.create();

        expect(
          getFirstParam(CMS.Models.Evidence).link
        ).toBe(value);
      });

      it('title equals to viewModel.value', function () {
        const value = 'SomeValue';
        viewModel.attr('value', value);

        viewModel.create();

        expect(
          getFirstParam(CMS.Models.Evidence).title
        ).toBe(value);
      });

      describe('context', () => {
        it('equals to viewModel.context if it exists', function () {
          const context = new can.Map();
          viewModel.attr('context', context);

          viewModel.create();

          expect(
            getFirstParam(CMS.Models.Evidence).context
          ).toBe(context);
        });

        it('equals to context instance with id = null if viewModel.context ' +
        'does not exist', function () {
          const expectedContext = {
            id: null,
          };
          CMS.Models.Context.and.returnValue(expectedContext);

          viewModel.create();
          const result = getFirstParam(CMS.Models.Evidence).context;

          expect(CMS.Models.Context).toHaveBeenCalledWith(expectedContext);
          expect(result).toBe(expectedContext);
        });
      });

      it('sets created_at to current time', function () {
        jasmine.clock().install();

        const date = new Date();
        jasmine.clock().mockDate(date);

        viewModel.create();

        expect(
          getFirstParam(CMS.Models.Evidence).created_at
        ).toEqual(date);

        jasmine.clock().uninstall();
      });

      it('sets isDraft to true', function () {
        viewModel.create();
        expect(
          getFirstParam(CMS.Models.Evidence).isDraft
        ).toBe(true);
      });

      it('sets _stamp to current time in milliseconds', function () {
        jasmine.clock().install();

        const date = new Date();
        jasmine.clock().mockDate(date);

        viewModel.create();

        expect(
          getFirstParam(CMS.Models.Evidence)._stamp
        ).toBe(date.getTime());

        jasmine.clock().uninstall();
      });
    });

    describe('when save operation was resolved', () => {
      it('dispatches "created" event for VM with item equals to response ' +
      'value after save', function () {
        const data = {};

        spyOn(viewModel, 'dispatch');
        saveDfd.resolve(data);
        viewModel.create();

        expect(viewModel.dispatch).toHaveBeenCalledWith({
          type: 'created',
          item: data,
        });
      });

      it('calls clear method', function () {
        spyOn(viewModel, 'clear');
        saveDfd.resolve();
        viewModel.create();
        expect(viewModel.clear).toHaveBeenCalled();
      });
    });

    describe('when save operation was rejected', () => {
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

  describe('clear() method', () => {
    it('sets value field to null', function () {
      viewModel.attr('value', 1);
      viewModel.clear();
      expect(viewModel.attr('value')).toBeNull();
    });
  });
});
