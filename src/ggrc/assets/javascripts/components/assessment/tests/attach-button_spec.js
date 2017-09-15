/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.attachButton', function () {
  'use strict';

  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('attachButton');
    viewModel.attr('instance', new CMS.Models.Assessment());
  });

  describe('itemsUploadedCallback() method', function () {
    it('dispatches "refreshInstance" event', function () {
      spyOn(viewModel.instance, 'dispatch');
      viewModel.itemsUploadedCallback();

      expect(viewModel.instance.dispatch)
        .toHaveBeenCalledWith('refreshInstance');
    });

    it('does not throw error if instance is not provided', function () {
      viewModel.removeAttr('instance');

      expect(viewModel.itemsUploadedCallback.bind(viewModel))
        .not.toThrowError();
    });
  });

  describe('confirmationCallback() method', function () {
    it('returns $.Deferred.promise if instance is not in "In Progress" state',
    function () {
      var dfd = can.Deferred();
      var result;
      viewModel.attr('instance.status', 'In Review');
      spyOn(can, 'Deferred').and.returnValue(dfd);

      result = viewModel.confirmationCallback();

      expect(result).toBe(dfd.promise());
    });

    it('returns null if instance is in "In Progress" state', function () {
      var result;
      viewModel.attr('instance.status', 'In Progress');

      result = viewModel.confirmationCallback();

      expect(result).toBe(null);
    });

    it('initializes confirmation modal with correct options', function () {
      viewModel.attr('instance.status', 'In Review');
      spyOn(GGRC.Controllers.Modals, 'confirm');

      viewModel.confirmationCallback();

      expect(GGRC.Controllers.Modals.confirm).toHaveBeenCalledWith({
        modal_title: 'Confirm moving Assessment to "In Progress"',
        modal_description: 'You are about to move Assessment from "' +
          'In Review' +
          '" to "In Progress" - are you sure about that?',
        button_view: GGRC.mustache_path + '/modals/prompt_buttons.mustache'
      }, jasmine.any(Function), jasmine.any(Function));
    });

    it('resolves Deferred if modal has been confirmed', function () {
      var result;
      viewModel.attr('instance.status', 'In Review');
      spyOn(GGRC.Controllers.Modals, 'confirm').and.callFake(
      function (options, confirm, cancel) {
        confirm();
      });

      result = viewModel.confirmationCallback();

      expect(result.state()).toBe('resolved');
    });

    it('rejects Deferred if modal has been canceled', function () {
      var result;
      viewModel.attr('instance.status', 'In Review');
      spyOn(GGRC.Controllers.Modals, 'confirm').and.callFake(
      function (options, confirm, cancel) {
        cancel();
      });

      result = viewModel.confirmationCallback();

      expect(result.state()).toBe('rejected');
    });
  });

  describe('checkFolder() method', function () {
    describe('when result of findFolder method was resolved', function () {
      it('sets isFolderAttached field for viewModel to true if a folder ' +
      'was arrived', function () {
        var dfd = can.Deferred().resolve({});

        spyOn(viewModel, 'findFolder').and.returnValue(dfd);
        viewModel.checkFolder();

        expect(viewModel.attr('isFolderAttached')).toBe(true);
      });

      it('sets canAttach field for viewModel to true', function () {
        var dfd = can.Deferred().resolve();

        spyOn(viewModel, 'findFolder').and.returnValue(dfd);
        viewModel.checkFolder();

        expect(viewModel.attr('canAttach')).toBe(true);
      });
    });

    describe('when result of findFolder method was rejected', function () {
      it('sets error field for viewModel to error which was catched',
      function () {
        var error = new Error('Error');
        var dfd = can.Deferred().reject(error);

        spyOn(viewModel, 'findFolder').and.returnValue(dfd);
        viewModel.checkFolder();

        expect(viewModel.attr('error')).toBe(error);
      });

      it('sets canAttach field for viewModel to false', function () {
        var dfd = can.Deferred().reject();

        spyOn(viewModel, 'findFolder').and.returnValue(dfd);
        viewModel.checkFolder();

        expect(viewModel.attr('canAttach')).toBe(false);
      });
    });

    describe('when result of findFolder method was rejected or resolved',
    function () {
      it('checks checksPassed field for viewModel to false', function () {
        var dfd = can.Deferred().resolve();

        spyOn(viewModel, 'findFolder').and.returnValue(dfd);
        viewModel.checkFolder();

        expect(viewModel.attr('checksPassed')).toBe(true);
      });
    });
  });
});
