/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.assessmentInfoPane', function () {
  'use strict';
  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('assessmentInfoPane');
  });

  describe('setUrlEditMode method()', function () {
    it('sets value for VM attribute based on type', function () {
      var type = 'Type';
      var value = {data: 'Important data'};
      var expectedProp = type + 'EditMode';

      viewModel.setUrlEditMode(value, type);

      expect(viewModel
        .attr(expectedProp)
        .serialize()
      ).toEqual(value);
    });
  });

  describe('setInProgressState method()', function () {
    beforeEach(function () {
      spyOn(viewModel, 'onStateChange');
    });

    it('calls onStateChange with object where state = "In Progress" and ' +
    'undo = false"',
    function () {
      var obj = {state: 'In Progress', undo: false};
      viewModel.setInProgressState();
      expect(viewModel.onStateChange).toHaveBeenCalledWith(obj);
    });
  });

  describe('getQuery method()', function () {
    var buildParam;

    beforeEach(function () {
      spyOn(GGRC.Utils.QueryAPI, 'buildParam');
      buildParam = GGRC.Utils.QueryAPI.buildParam;
    });

    it('returns result of GGRC.Utils.QueryAPI.buildParam function',
    function () {
      var expected = {};
      var result;

      buildParam.and.returnValue(expected);
      result = viewModel.getQuery();

      expect(result).toBe(expected);
    });

    describe('calls GGRC.Utils.QueryAPI.buildParam with', function () {
      var ARGS;

      beforeAll(function () {
        ARGS = {
          TYPE: 0,
          SORT_OBJ: 1,
          REL_FILTER: 2,
          FIELDS: 3,
          ADT_FILTER: 4
        };
      });

      beforeEach(function () {
        viewModel.attr('instance', {
          type: 'instanceType',
          id: 1
        });
      });

      it('passed type', function () {
        var args;
        var type = 'Type';

        viewModel.getQuery(type, {}, []);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.TYPE]).toBe(type);
      });

      it('passed sortObj', function () {
        var args;
        var sortObj = {};

        viewModel.getQuery('Type', sortObj, []);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.SORT_OBJ]).toBe(sortObj);
      });

      it('empty obj if sortObj is empty', function () {
        var args;
        var sortObj = null;

        viewModel.getQuery('Type', sortObj, []);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.SORT_OBJ]).toEqual({});
      });

      it('relevant filter made from instance type and id', function () {
        var args;
        var relevantFilters = [{
          type: viewModel.attr('instance.type'),
          id: viewModel.attr('instance.id'),
          operation: 'relevant'
        }];

        viewModel.getQuery('Type', {}, []);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.REL_FILTER]).toEqual(relevantFilters);
      });

      it('empty array of fields', function () {
        var args;

        viewModel.getQuery('Type', {}, []);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.FIELDS]).toEqual([]);
      });

      it('passed additional filter', function () {
        var args;
        var adtFilter = [];

        viewModel.getQuery('Type', {}, adtFilter);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.ADT_FILTER]).toBe(adtFilter);
      });

      it('empty array if additional filter is empty', function () {
        var args;
        var adtFilter = null;

        viewModel.getQuery('Type', {}, adtFilter);
        args = buildParam.calls.argsFor(0);

        expect(args[ARGS.ADT_FILTER]).toEqual([]);
      });
    });
  });

  describe('getCommentQuery method()', function () {
    beforeEach(function () {
      spyOn(viewModel, 'getQuery');
    });

    it('returns result of getQuery method', function () {
      var result;
      var fakeQuery = {};

      viewModel.getQuery.and.returnValue(fakeQuery);
      result = viewModel.getCommentQuery();

      expect(result).toBe(fakeQuery);
    });

    it('sets "Comment" type and sortObj for getQuery method', function () {
      var type = 'Comment';
      var sortObj = {
        sortBy: 'created_at',
        sortDirection: 'desc'
      };

      viewModel.getCommentQuery();

      expect(viewModel.getQuery).toHaveBeenCalledWith(type, sortObj);
    });
  });

  describe('getSnapshotQuery method()', function () {
    beforeEach(function () {
      spyOn(viewModel, 'getQuery');
    });

    it('returns result of getQuery method', function () {
      var result;
      var fakeQuery = {};

      viewModel.getQuery.and.returnValue(fakeQuery);
      result = viewModel.getSnapshotQuery();

      expect(result).toBe(fakeQuery);
    });

    it('sets "Snapshot" type for getQuery method', function () {
      var type = 'Snapshot';
      viewModel.getSnapshotQuery();
      expect(viewModel.getQuery).toHaveBeenCalledWith(type);
    });
  });

  describe('getDocumentQuery method()', function () {
    beforeEach(function () {
      spyOn(viewModel, 'getQuery');
      spyOn(viewModel, 'getDocumentAdditionFilter');
    });

    it('returns result of getQuery method', function () {
      var result;
      var fakeQuery = {};

      viewModel.getQuery.and.returnValue(fakeQuery);
      result = viewModel.getDocumentQuery();

      expect(result).toBe(fakeQuery);
    });

    it('calls getDocumentAdditionFilter method with passed documentType',
    function () {
      var type = 'My_awesome_type';
      viewModel.getDocumentQuery(type);
      expect(viewModel.getDocumentAdditionFilter).toHaveBeenCalledWith(type);
    });

    it('sets "Document" type, sortObj and additional filter for getQuery ' +
    'method', function () {
      var type = 'Document';
      var sortObj = {
        sortBy: 'created_at',
        sortDirection: 'desc'
      };
      var adtFilter = {};

      viewModel.getDocumentAdditionFilter.and.returnValue(adtFilter);
      viewModel.getDocumentQuery();

      expect(viewModel.getQuery).toHaveBeenCalledWith(
        type,
        sortObj,
        adtFilter
      );
    });
  });

  describe('requestQuery method()', function () {
    var origBatchRequests;

    beforeAll(function () {
      origBatchRequests = GGRC.Utils.QueryAPI.batchRequests;
    });

    afterAll(function () {
      GGRC.Utils.QueryAPI.batchRequests = origBatchRequests;
    });

    beforeEach(function () {
      GGRC.Utils.QueryAPI.batchRequests = jasmine
        .createSpy('batchRequests').and
        .returnValue(can.Deferred());
    });

    it('sets "isUpdating{<some capitalized type>}" property based on passed ' +
    'type to true before resolving a request', function () {
      var type = 'type';
      var expectedProp = 'isUpdating' + can.capitalize(type);

      viewModel.requestQuery({}, type);
      expect(viewModel.attr(expectedProp)).toBe(true);
    });

    it('make request with help passed query', function () {
      var query = {
        param1: '',
        param2: ''
      };
      viewModel.requestQuery(query);
      expect(GGRC.Utils.QueryAPI.batchRequests).toHaveBeenCalledWith(query);
    });

    describe('after resolving a request', function () {
      var response;

      beforeEach(function () {
        response = {
          type1: {
            values: []
          },
          type2: {
            values: []
          }
        };

        GGRC.Utils.QueryAPI.batchRequests = jasmine
          .createSpy('batchRequests').and
          .returnValue(
            can.Deferred().resolve(response)
          );
      });

      it('sets "isUpdating{<some capitalized type>}" property based on ' +
      'passed type to false after request', function (done) {
        var type = 'type';
        var expectedProp = 'isUpdating' + can.capitalize(type);

        viewModel
          .requestQuery({}, type)
          .then(function () {
            expect(viewModel.attr(expectedProp)).toBe(false);
            done();
          });
      });

      it('sets "isUpdating" property is passed type is empty', function (done) {
        var expectedProp = 'isUpdating';

        viewModel
          .requestQuery({})
          .then(function () {
            expect(viewModel.attr(expectedProp)).toBe(false);
            done();
          });
      });

      it('returns deferred with values from first response object',
      function (done) {
        viewModel
          .requestQuery({})
          .then(function (resp) {
            expect(resp).toBe(response.type1.values);
            done();
          });
      });

      it('returns deferred with empty array if dfd was rejected',
      function (done) {
        GGRC.Utils.QueryAPI.batchRequests = jasmine
          .createSpy('batchRequests').and
          .returnValue(
            can.Deferred().reject()
          );

        viewModel
        .requestQuery({})
        .then(function (resp) {
          expect(resp).toEqual([]);
          done();
        });
      });

      it('sets isUpdatingRelatedItems to false if it is true', function (done) {
        viewModel.attr('isUpdatingRelatedItems', true);
        viewModel
        .requestQuery({})
        .then(function (resp) {
          var result = viewModel.attr('isUpdatingRelatedItems');
          expect(result).toEqual(false);
          done();
        });
      });
    });
  });

  describe('loadSnapshots method()', function () {
    var query;
    var requestResult;

    beforeEach(function () {
      query = {};
      requestResult = can.Deferred().resolve();

      spyOn(viewModel, 'requestQuery').and.returnValue(requestResult);
      spyOn(viewModel, 'getSnapshotQuery').and.returnValue(query);
    });

    it('returns result of requestQuery', function () {
      var result = viewModel.loadSnapshots();
      expect(result).toBe(requestResult);
    });

    it('uses query for Snapshots', function () {
      viewModel.loadSnapshots();
      expect(viewModel.requestQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('loadComments method()', function () {
    var query;
    var requestResult;

    beforeEach(function () {
      query = {};
      requestResult = can.Deferred().resolve();

      spyOn(viewModel, 'requestQuery').and.returnValue(requestResult);
      spyOn(viewModel, 'getCommentQuery').and.returnValue(query);
    });

    it('returns result of requestQuery', function () {
      var result = viewModel.loadComments();
      expect(result).toBe(requestResult);
    });

    it('uses query for Comments and "comments" type', function () {
      var type = 'comments';
      viewModel.loadComments();
      expect(viewModel.requestQuery).toHaveBeenCalledWith(query, type);
    });
  });

  describe('loadEvidences method()', function () {
    var query;
    var requestResult;

    beforeEach(function () {
      query = {};
      requestResult = can.Deferred().resolve();

      spyOn(viewModel, 'requestQuery').and.returnValue(requestResult);
      spyOn(viewModel, 'getDocumentQuery').and.returnValue(query);
    });

    it('forms query from documentTypes.evidences', function () {
      var evidences;
      var docTypes = 'documentTypes.evidences';

      viewModel.attr(docTypes, {});
      viewModel.loadEvidences();
      evidences = viewModel.attr(docTypes);

      expect(viewModel.getDocumentQuery).toHaveBeenCalledWith(evidences);
    });

    it('returns result of requestQuery', function () {
      var result = viewModel.loadEvidences();
      expect(result).toBe(requestResult);
    });

    it('uses query for Evidences and "evidences" type', function () {
      var type = 'evidences';
      viewModel.loadEvidences();
      expect(viewModel.requestQuery).toHaveBeenCalledWith(query, type);
    });
  });

  describe('loadUrls method()', function () {
    var query;
    var requestResult;

    beforeEach(function () {
      query = {};
      requestResult = can.Deferred().resolve();

      spyOn(viewModel, 'requestQuery').and.returnValue(requestResult);
      spyOn(viewModel, 'getDocumentQuery').and.returnValue(query);
    });

    it('forms query from documentTypes.urls', function () {
      var urls;
      var docTypes = 'documentTypes.urls';

      viewModel.attr(docTypes, {});
      viewModel.loadUrls();
      urls = viewModel.attr(docTypes);

      expect(viewModel.getDocumentQuery).toHaveBeenCalledWith(urls);
    });

    it('returns result of requestQuery', function () {
      var result = viewModel.loadUrls();
      expect(result).toBe(requestResult);
    });

    it('uses query for Urls and "url" type', function () {
      var type = 'urls';
      viewModel.loadUrls();
      expect(viewModel.requestQuery).toHaveBeenCalledWith(query, type);
    });
  });

  describe('loadReferenceUrls method()', function () {
    var query;
    var requestResult;

    beforeEach(function () {
      query = {};
      requestResult = can.Deferred().resolve();

      spyOn(viewModel, 'requestQuery').and.returnValue(requestResult);
      spyOn(viewModel, 'getDocumentQuery').and.returnValue(query);
    });

    it('forms query from documentTypes.referenceUrls', function () {
      var referenceUrls;
      var docTypes = 'documentTypes.referenceUrls';

      viewModel.attr(docTypes, {});
      viewModel.loadReferenceUrls();
      referenceUrls = viewModel.attr(docTypes);

      expect(viewModel.getDocumentQuery).toHaveBeenCalledWith(referenceUrls);
    });

    it('returns result of requestQuery', function () {
      var result = viewModel.loadReferenceUrls();
      expect(result).toBe(requestResult);
    });

    it('uses query for ReferenceUrls and "referenceUrls" type', function () {
      var type = 'referenceUrls';
      viewModel.loadReferenceUrls();
      expect(viewModel.requestQuery).toHaveBeenCalledWith(query, type);
    });
  });

  describe('updateItems method()', function () {
    var types;
    var loadedData;

    beforeEach(function () {
      loadedData = [1, 2, 3];
      types = ['Urls', 'Evidences'];

      _.each(types, function (type) {
        var methodName = 'load' + type;
        viewModel.attr(type, []);
        spyOn(viewModel, methodName).and.returnValue(loadedData);
      });
    });

    it('calls appopriate methods with the passed capitalized types',
    function () {
      var notCapitalized = _.map(types, function (type) {
        return type.toLowerCase();
      });

      viewModel.updateItems.apply(viewModel, notCapitalized);

      _.each(types, function (type) {
        var methodName = 'load' + type;
        expect(viewModel[methodName]).toHaveBeenCalled();
      });
    });

    it('replaces values of passed fields in VM with the results of ' +
    'appopriate methods', function () {
      viewModel.updateItems.apply(viewModel, types);

      _.each(types, function (type) {
        var data = viewModel
          .attr(type)
          .serialize();
        expect(data).toEqual(loadedData);
      });
    });

    it('not throws an exception if types is not passed', function () {
      var closure = function () {
        viewModel.updateItems();
      };

      expect(closure).not.toThrow();
    });
  });

  describe('afterCreate method()', function () {
    var items;
    var event;
    var type;

    beforeEach(function () {
      var commonStamp;
      var beforeCreate;

      type = 'type';
      commonStamp = [{}, {}];
      beforeCreate = [{
        data: 'Fake data 1',
        isDraft: false,
        _stamp: commonStamp[0]
      }, {
        data: 'Fake data 2',
        isDraft: false,
        _stamp: commonStamp[1]
      }, {
        data: 'Fake data 3',
        isDraft: false,
        _stamp: {}
      }];
      viewModel.attr(type, beforeCreate);

      items = new can.List([{
        data: 'Important data 1',
        isDraft: true,
        _stamp: viewModel
          .attr(type)[1]
          .attr('_stamp')
      }, {
        data: 'Important data 2',
        isDraft: true,
        _stamp: viewModel
          .attr(type)[0]
          .attr('_stamp')
      }, {
        data: 'Important data 3',
        isDraft: true,
        _stamp: {}
      }]);

      event = {
        items: items,
        success: true
      };
    });

    it('sets "isUpdating{<some capitalized type>}" property based on passed ' +
    'type to false', function () {
      var expectedProp = 'isUpdating' + can.capitalize(type);

      viewModel.attr(expectedProp, true);
      viewModel.afterCreate(event, type);

      expect(viewModel.attr(expectedProp)).toBe(false);
    });

    it('sets new items only if each item from them is saved', function () {
      var expectedResult = [{
        data: 'Important data 2'
      }, {
        data: 'Fake data 3',
        isDraft: false,
        _stamp: {}
      }];
      items[0].attr('isNotSaved', true);
      viewModel.afterCreate(event, type);
      expect(viewModel
        .attr(type)
        .serialize()
      ).toEqual(expectedResult);
    });

    describe('if some item from passed items has the same _stamp field value ' +
    '(strict equality) as some item from original items array', function () {
      it('removes _stamp and isDraft props from passed items placed in event ' +
      'object', function () {
        var expected = [{
          data: 'Important data 1'
        }, {
          data: 'Important data 2'
        }, {
          data: 'Important data 3',
          isDraft: true,
          _stamp: {}
        }];

        viewModel.afterCreate(event, type);

        expect(items.serialize()).toEqual(expected);
      });

      it('sets the flag isNotSaved to true for item from passed items if ' +
      'event.success is false', function () {
        var expected = [{
          data: 'Important data 1',
          isNotSaved: true
        }, {
          data: 'Important data 2',
          isNotSaved: true
        }, {
          data: 'Important data 3',
          isDraft: true,
          _stamp: {}
        }];

        event.success = false;
        viewModel.afterCreate(event, type);

        expect(items.serialize()).toEqual(expected);
      });
    });
  });
});
