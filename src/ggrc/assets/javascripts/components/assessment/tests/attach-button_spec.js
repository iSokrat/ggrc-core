/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

/* eslint max-nested-callbacks:0 */
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
    describe('when result of findFolder method', function () {
      var dfd;

      beforeEach(function () {
        dfd = can.Deferred();
      });

      describe('was resolved', function () {
        it('sets isFolderAttached field for viewModel to true if a folder ' +
        'was arrived', function () {
          spyOn(viewModel, 'findFolder').and.returnValue(dfd.resolve({}));
          viewModel.checkFolder();
          expect(viewModel.attr('isFolderAttached')).toBe(true);
        });

        it('sets canAttach field for viewModel to true', function () {
          spyOn(viewModel, 'findFolder').and.returnValue(dfd.resolve());
          viewModel.checkFolder();
          expect(viewModel.attr('canAttach')).toBe(true);
        });
      });

      describe('was rejected', function () {
        it('sets error field for viewModel to error which was catched',
        function () {
          var error = new Error('Error');
          spyOn(viewModel, 'findFolder').and.returnValue(dfd.reject(error));
          viewModel.checkFolder();
          expect(viewModel.attr('error')).toBe(error);
        });

        it('sets canAttach field for viewModel to false', function () {
          spyOn(viewModel, 'findFolder').and.returnValue(dfd.reject());
          viewModel.checkFolder();
          expect(viewModel.attr('canAttach')).toBe(false);
        });
      });

      describe('was rejected or resolved',
      function () {
        it('checks checksPassed field for viewModel to false', function () {
          spyOn(viewModel, 'findFolder').and.returnValue(dfd.resolve());
          viewModel.checkFolder();
          expect(viewModel.attr('checksPassed')).toBe(true);
        });
      });
    });
  });

  describe('findFolderId() method', function () {
    var findAll;
    var findDfd;

    beforeEach(function () {
      findDfd = can.Deferred();
      findAll = spyOn(CMS.Models.ObjectFolder, 'findAll');
      findAll.and.returnValue(findDfd);
    });

    it('returns deferred object', function () {
      var result = viewModel.findFolderId();
      expect(can.isDeferred(result)).toBe(true);
    });

    it('sets settings for findAll', function () {
      var audit = {id: 1};
      viewModel.attr('instance', {
        audit: audit
      });
      viewModel.findFolderId();
      expect(findAll).toHaveBeenCalledWith({
        folderable_id: audit.id,
        folderable_type: 'Audit'
      });
    });

    describe('when findFolder was resolved', function () {
      var folders;

      beforeEach(function () {
        folders = [];
      });

      it('sets canAttach field for viewModel to true', function (done) {
        findDfd.resolve(folders);
        viewModel.findFolderId()
          .then(function () {
            expect(viewModel.attr('canAttach')).toBe(true);
            done();
          });
      });

      it('returns folder_id for first folder', function (done) {
        var folder = {folder_id: 1};

        folders.push(folder);
        viewModel.attr('canAttach', false);
        findDfd.resolve(folders);

        viewModel.findFolderId()
          .then(function (folderId) {
            expect(folderId).toBe(folder.folder_id);
            expect(viewModel.attr('canAttach')).toBe(false);
            done();
          });
      });
    });
  });

  describe('findFolder() method', function () {
    it('returns deferred result', function () {
      var result = viewModel.findFolder();
      expect(can.isDeferred(result)).toBe(true);
    });

    describe('when result of findFolderId', function () {
      var dfd;

      beforeEach(function () {
        dfd = can.Deferred();
        spyOn(viewModel, 'findFolderId').and.returnValue(dfd);
      });

      describe('was resolved', function () {
        it('returns resolved can.Deferred if there was not arrived id',
        function (done) {
          dfd.resolve();
          viewModel.findFolder()
            .then(_.identity)
            .then(done);
        });

        it('sets settings for CMS.Models.GDriveFolder.findOne',
        function (done) {
          var id = 1;
          var findOne = spyOn(CMS.Models.GDriveFolder, 'findOne');

          dfd.resolve(id);
          viewModel
            .findFolder()
            .then(function () {
              expect(findOne).toHaveBeenCalledWith({id: id});
              done();
            });
        });

        it('returns result of CMS.Models.GDriveFolder.findOne',
        function (done) {
          var result = {};
          var findOne = spyOn(CMS.Models.GDriveFolder, 'findOne');

          findOne.and.returnValue(result);
          dfd.resolve(1);
          viewModel
            .findFolder()
            .then(function (findOneResult) {
              expect(findOneResult).toBe(result);
              done();
            });
        });
      });
    });
  });
});
