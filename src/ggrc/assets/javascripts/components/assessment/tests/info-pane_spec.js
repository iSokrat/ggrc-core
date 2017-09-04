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

    it('sets "isUpdating{<some type>}" property based on passed capitalized ' +
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

      it('sets "isUpdating{<some type>}" property based on passed ' +
      'capitalized type to false after request', function (done) {
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
});
