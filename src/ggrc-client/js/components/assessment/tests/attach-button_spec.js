/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import * as gDriveUtils from '../../../plugins/utils/gdrive-picker-utils';

describe('GGRC.Components.attachButton', function () {
  'use strict';

  let viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('attachButton');
    viewModel.attr('instance', new CMS.Models.Assessment());
  });

  describe('refresh() method', function () {
    it('dispatches "refreshInstance" event', function () {
      spyOn(viewModel.instance, 'dispatch');
      viewModel.refresh();

      expect(viewModel.instance.dispatch)
        .toHaveBeenCalledWith('refreshInstance');
    });

    it('does not throw error if instance is not provided', function () {
      viewModel.removeAttr('instance');

      expect(viewModel.refresh.bind(viewModel))
        .not.toThrowError();
    });
  });

  describe('checkFolder() method', function () {
    it('should set isFolderAttached to true when folder is attached',
      function () {
        viewModel.attr('isFolderAttached', false);
        viewModel.attr('instance.folder', 'gdrive_folder_id');

        spyOn(viewModel, 'findFolder').and
          .returnValue(can.Deferred().resolve({}));

        viewModel.checkFolder();
        expect(viewModel.attr('isFolderAttached')).toBe(true);
      });

    it('should set isFolderAttached to false when folder is not attached',
      function () {
        viewModel.attr('isFolderAttached', true);
        viewModel.attr('instance.folder', null);

        spyOn(viewModel, 'findFolder').and
          .returnValue(can.Deferred().resolve());

        viewModel.checkFolder();
        expect(viewModel.attr('isFolderAttached')).toBe(false);
      });

    it('set correct isFolderAttached if instance refreshes during ' +
      'request to GDrive', function () {
      let dfd = can.Deferred();
      spyOn(gDriveUtils, 'findGDriveItemById').and.returnValue(dfd);

      viewModel.attr('instance.folder', 'gdrive_folder_id');
      viewModel.checkFolder(); // makes request to GDrive

      // instance is refreshed and folder becomes null
      viewModel.attr('instance.folder', null);
      viewModel.checkFolder();

      // resolve request to GDrive after instance refreshing
      dfd.resolve({folderId: 'gdrive_folder_id'});

      expect(viewModel.attr('isFolderAttached')).toBe(false);
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
