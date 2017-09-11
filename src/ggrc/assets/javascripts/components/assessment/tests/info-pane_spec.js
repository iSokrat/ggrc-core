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

    it('sets "isUpdating{<passed capitalized type>}" property to true before ' +
    'resolving a request', function () {
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

      it('sets "isUpdating{<passed capitalized type>}" property to false ' +
      'after request', function (done) {
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

    it('sets "isUpdating{<passed capitalized type>}" property to false',
    function () {
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

  describe('addItems method()', function () {
    var type;
    var event;

    beforeEach(function () {
      type = 'Type';
      event = {
        items: [1, 2, 3]
      };
      viewModel.attr(type, [4, 5, 6]);
    });

    it('pushes items from event into beginning of the list with name from ' +
    'type param', function () {
      var beforeInvoke = viewModel.attr(type).serialize();
      var expectedResult = event.items.concat(beforeInvoke);

      viewModel.addItems(event, type);

      expect(viewModel
        .attr(type)
        .serialize()
      ).toEqual(expectedResult);
    });

    it('sets "isUpdating{<passed capitalized type>}" property to true',
    function () {
      var expectedProp = 'isUpdating' + can.capitalize(type);
      viewModel.attr(expectedProp, false);

      viewModel.addItems(event, type);
      expect(viewModel.attr(expectedProp)).toBe(true);
    });

    it('makes array from event.items if it is array-like object', function () {
      var beforeInvoke = viewModel.attr(type).serialize();
      var expectedResult = event.items.concat(beforeInvoke);

      event.items = new can.List(event.items);
      viewModel.addItems(event, type);

      expect(viewModel
        .attr(type)
        .serialize()
      ).toEqual(expectedResult);
    });
  });

  describe('getDocumentAdditionFilter method()', function () {
    it('configures filter based on passed type', function () {
      var documentType = 'Type';
      var expectedResult = {
        expression: {
          left: 'document_type',
          op: {name: '='},
          right: documentType
        }
      };
      var result = viewModel.getDocumentAdditionFilter(documentType);
      expect(result).toEqual(expectedResult);
    });

    it('returns empty array if passed documentType is empty', function () {
      var result = viewModel.getDocumentAdditionFilter();
      expect(result).toEqual([]);
    });
  });

  describe('addAction method()', function () {
    var actionType;
    var related;
    var actionsRoot;

    beforeEach(function () {
      var instanceName = 'instance';

      actionsRoot = instanceName + '.actions';
      actionType = 'actionType';
      related = {
        data: 'Important data'
      };
      viewModel.attr(instanceName, {});
    });

    it('sets instance.actions to empty object if there are no actions',
    function () {
      viewModel.addAction(actionType, related);
      expect(viewModel.attr(actionsRoot)).toBeDefined();
    });

    it('pushes into actions.{<passed actionType>} passed related item if ' +
    'there is actions.{<passed actionType>}', function () {
      var last;
      var itemsPath = actionsRoot + '.' + actionType;

      viewModel.attr(actionsRoot, {});
      viewModel.attr(itemsPath, [{}]);
      viewModel.addAction(actionType, related);

      last = viewModel.attr(itemsPath).pop();
      expect(last.serialize()).toEqual(related);
    });

    it('creates actions.{<passed actionType>} list for instance with passed ' +
    'related item', function () {
      var expected = [related];
      var itemsPath = actionsRoot + '.' + actionType;
      viewModel.addAction(actionType, related);
      expect(viewModel
        .attr(itemsPath)
        .serialize()
      ).toEqual(expected);
    });
  });

  describe('addRelatedItem method()', function () {
    var assessment;
    var event;
    var type;
    var related;
    var dfd;

    beforeEach(function () {
      dfd = can.Deferred();
      type = 'type';
      event = {
        item: new can.Map({
          id: 1,
          type: 'Type'
        })
      };
      related = {
        id: event.item.attr('id'),
        type: event.item.attr('type')
      };
      assessment = new can.Map({
        actions: []
      });

      viewModel.attr('instance', {});
      viewModel.attr('instance').dispatch = jasmine.createSpy('dispatch');
      viewModel.attr('deferredSave', {
        push: jasmine.createSpy('push').and.returnValue(dfd)
      });

      spyOn(viewModel, 'addAction');
      spyOn(viewModel, 'afterCreate');
    });

    it('dispatches afterCommentCreated event on instance', function () {
      var instance = viewModel.attr('instance');
      viewModel.addRelatedItem(event, type);
      expect(instance.dispatch).toHaveBeenCalled();
    });

    it('pushes into deferredSave transaction queue a function', function () {
      var dfdQueue = viewModel.attr('deferredSave');
      viewModel.addRelatedItem(event, type);
      expect(dfdQueue.push).toHaveBeenCalledWith(jasmine.any(Function));
    });

    describe('pushed function into deferredSave', function () {
      var pushedFunc;

      beforeEach(function () {
        viewModel.addRelatedItem(event, type);
        pushedFunc = viewModel.attr('deferredSave').push.calls.argsFor(0)[0];
      });

      it('adds add_related action with related object', function () {
        pushedFunc();
        expect(viewModel.addAction).toHaveBeenCalledWith(
          'add_related',
          related
        );
      });
    });

    describe('resolves deferredSave', function () {
      beforeEach(function () {
        dfd.resolve(assessment);
      });

      it('calls afterCreate with appopriate params with success equals ' +
      'to true', function (done) {
        viewModel.addRelatedItem(event, type);
        dfd.then(function () {
          expect(viewModel.afterCreate.calls.count()).toBe(1);
          expect(viewModel.afterCreate).toHaveBeenCalledWith({
            items: [event.item],
            success: true
          }, type);
          done();
        });
      });
    });

    describe('rejects deferredSave', function () {
      beforeEach(function () {
        dfd.reject(assessment);
      });

      it('calls afterCreate with appopriate params with success equals to ' +
      'false', function (done) {
        dfd.reject(assessment);
        viewModel.addRelatedItem(event, type);
        dfd.fail(function () {
          expect(viewModel.afterCreate.calls.count()).toBe(1);
          expect(viewModel.afterCreate).toHaveBeenCalledWith({
            items: [event.item],
            success: false
          }, type);
          done();
        });
      });
    });

    describe('executes always after deferredSave resolving or rejecting',
    function () {
      it('removes actions for assessment from response after resolve',
      function (done) {
        dfd.resolve(assessment);
        viewModel.addRelatedItem(event, type);
        dfd.always(function () {
          expect(assessment.attr('actions')).toBeUndefined();
          done();
        });
      });

      it('removes actions for assessment from response after reject',
      function (done) {
        dfd.reject(assessment);
        viewModel.addRelatedItem(event, type);
        dfd.always(function () {
          expect(assessment.attr('actions')).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('removeRelatedItem method()', function () {
    var dfd;
    var type;
    var item;
    var items;
    var related;
    var assessment;

    beforeEach(function () {
      var countOfItems = 3;
      dfd = can.Deferred();
      type = 'type';
      items = new can.List(
        Array(countOfItems)
      ).map(function (item, index) {
        return {
          id: index,
          type: 'Awesome type'
        };
      });
      item = items.attr(countOfItems - 1);
      related = {
        id: item.attr('id'),
        type: item.attr('type')
      };
      assessment = new can.Map({
        actions: []
      });
      viewModel.attr(type, items);
      viewModel.attr('deferredSave', {
        push: jasmine.createSpy('push').and.returnValue(dfd)
      });

      spyOn(viewModel, 'addAction');
      spyOn(GGRC.Errors, 'notifier');
    });

    it('sets "isUpdating{<passed capitalized type>}" property to true ' +
    'before resolving a deferredSave', function () {
      var expectedProp = 'isUpdating' + can.capitalize(type);
      viewModel.removeRelatedItem(item, type);
      expect(viewModel.attr(expectedProp)).toBe(true);
    });

    it('removes passed item from {<passed type>} list', function () {
      viewModel.removeRelatedItem(item, type);
      expect(items.indexOf(item)).toBe(-1);
    });

    describe('pushed function into deferredSave', function () {
      var pushedFunc;

      beforeEach(function () {
        viewModel.removeRelatedItem(item, type);
        pushedFunc = viewModel.attr('deferredSave').push.calls.argsFor(0)[0];
      });

      it('adds remove_related action with related object', function () {
        pushedFunc();
        expect(viewModel.addAction).toHaveBeenCalledWith(
          'remove_related',
          related
        );
      });
    });

    describe('rejects deferredSave', function () {
      beforeEach(function () {
        dfd.reject(assessment);
      });

      it('shows error', function (done) {
        viewModel.removeRelatedItem(item, type);
        dfd.fail(function () {
          expect(GGRC.Errors.notifier).toHaveBeenCalledWith(
            'error',
            'Unable to remove URL.'
          );
          done();
        });
      });

      it('inserts removed item from {<passed type>} list at previous place',
      function (done) {
        viewModel.removeRelatedItem(item, type);
        dfd.fail(function () {
          expect(items.indexOf(item)).not.toBe(-1);
          done();
        });
      });
    });

    describe('executes always after deferredSave resolving or rejecting',
    function () {
      it('sets "isUpdating{<passed capitalized type>}" property to false ' +
      'after resolve',
      function (done) {
        var expectedProp = 'isUpdating' + can.capitalize(type);

        dfd.resolve(assessment);
        viewModel.removeRelatedItem(item, type);

        dfd.always(function () {
          expect(viewModel.attr(expectedProp)).toBe(false);
          done();
        });
      });

      it('removes actions for assessment from response after resolve',
      function (done) {
        dfd.resolve(assessment);
        viewModel.removeRelatedItem(item, type);

        dfd.always(function () {
          expect(assessment.attr('actions')).toBeUndefined();
          done();
        });
      });

      it('sets "isUpdating{<passed capitalized type>}" property to false ' +
      'after reject',
      function (done) {
        var expectedProp = 'isUpdating' + can.capitalize(type);

        dfd.reject(assessment);
        viewModel.removeRelatedItem(item, type);

        dfd.always(function () {
          expect(viewModel.attr(expectedProp)).toBe(false);
          done();
        });
      });

      it('removes actions for assessment from response after reject',
      function (done) {
        dfd.reject(assessment);
        viewModel.removeRelatedItem(item, type);

        dfd.always(function () {
          expect(assessment.attr('actions')).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('updateRelatedItems method()', function () {
    var results;

    beforeEach(function () {
      var loadPrefix = 'load';
      var data = [
        'Snapshots', 'Comments', 'Evidences', 'Urls', 'ReferenceUrls'
      ];
      results = data
        .map(function (item) {
          return loadPrefix + item;
        })
        .reduce(function (acc, methodName, index) {
          acc[methodName] = [index];
          return acc;
        }, {});
      _.each(results, function (returnValue, methodName) {
        spyOn(viewModel, methodName).and.returnValue(returnValue);
      });
    });

    it('sets isUpdatingRelatedItems property to true', function () {
      var prop = 'isUpdatingRelatedItems';
      viewModel.attr(prop, false);
      viewModel.updateRelatedItems();
      expect(viewModel.attr(prop)).toBe(true);
    });

    it('replaces mappedSnapshots list with loaded mapped snapshots',
    function () {
      var prop = 'mappedSnapshots';
      var ref = viewModel
        .attr(prop, [])
        .attr(prop);

      viewModel.updateRelatedItems();

      expect(viewModel.attr(prop)).toBe(ref);
      expect(viewModel.attr(prop).serialize()).toEqual(
        results.loadSnapshots
      );
    });

    it('replaces comments list with loaded comments', function () {
      var prop = 'comments';
      var data = viewModel
        .attr(prop, [])
        .attr(prop);

      viewModel.updateRelatedItems();

      expect(viewModel.attr(prop)).toBe(data);
      expect(viewModel.attr(prop).serialize()).toEqual(results.loadComments);
    });

    it('replaces evidances list with loaded evidances', function () {
      var prop = 'evidences';
      var data = viewModel
        .attr(prop, [])
        .attr(prop);

      viewModel.updateRelatedItems();

      expect(viewModel.attr(prop)).toBe(data);
      expect(viewModel.attr(prop).serialize()).toEqual(results.loadEvidences);
    });

    it('replaces urls list with loaded urls', function () {
      var prop = 'urls';
      var data = viewModel
        .attr(prop, [])
        .attr(prop);

      viewModel.updateRelatedItems();

      expect(viewModel.attr(prop)).toBe(data);
      expect(viewModel.attr(prop).serialize()).toEqual(results.loadUrls);
    });

    it('replaces referenceUrls list with loaded referenceUrls', function () {
      var prop = 'referenceUrls';
      var data = viewModel
        .attr(prop, [])
        .attr(prop);

      viewModel.updateRelatedItems();

      expect(viewModel.attr(prop)).toBe(data);
      expect(viewModel.attr(prop).serialize()).toEqual(
        results.loadReferenceUrls
      );
    });
  });

  describe('initializeFormFields method()', function () {
    var CAUtils;
    var results;

    beforeAll(function () {
      CAUtils = GGRC.Utils.CustomAttributes;
    });

    beforeEach(function () {
      viewModel.attr({
        formFields: [],
        instance: {
          custom_attribute_values: []
        }
      });
      results = [1, 2, 3];
      spyOn(CAUtils, 'getAttributes');
      spyOn(CAUtils, 'convertValuesToFormFields');
    });

    it('gets CA with help GGRC.Utils.CustomAttributes.getAttributes',
    function () {
      viewModel.initializeFormFields();
      expect(CAUtils.getAttributes).toHaveBeenCalledWith(
        viewModel.attr('instance.custom_attribute_values'), true
      );
    });

    it('converts CA values to form fields', function () {
      CAUtils.getAttributes.and.returnValue(results);
      viewModel.initializeFormFields();
      expect(CAUtils.convertValuesToFormFields).toHaveBeenCalledWith(results);
    });

    it('sets form fields to converted CA values', function () {
      CAUtils.convertValuesToFormFields.and.returnValue(results);
      viewModel.initializeFormFields();
      expect(
        viewModel.attr('formFields').serialize()
      ).toEqual(results);
    });
  });

  describe('initGlobalAttributes method()', function () {
    var CAUtils;
    var results;

    beforeAll(function () {
      CAUtils = GGRC.Utils.CustomAttributes;
    });

    beforeEach(function () {
      viewModel.attr({
        globalAttributes: [],
        instance: {
          custom_attribute_values: []
        }
      });
      results = [1, 2, 3];
      spyOn(CAUtils, 'getAttributes').and.returnValue(results);
      spyOn(CAUtils, 'convertToFormViewField').and.callFake(_.identity);
    });

    it('gets CA with help GGRC.Utils.CustomAttributes.getAttributes',
    function () {
      viewModel.initGlobalAttributes();
      expect(CAUtils.getAttributes).toHaveBeenCalledWith(
        viewModel.attr('instance.custom_attribute_values'), false
      );
    });

    it('converts CA values to form fields', function () {
      viewModel.initGlobalAttributes();
      _.each(results, function (result) {
        expect(CAUtils.convertToFormViewField).toHaveBeenCalledWith(result);
      });
    });

    it('sets form fields to converted CA values', function () {
      var expectedResult = results.map(CAUtils.convertToFormViewField);
      viewModel.initGlobalAttributes();
      expect(
        viewModel.attr('globalAttributes').serialize()
      ).toEqual(expectedResult);
    });
  });

  describe('initializeDeferredSave method()', function () {
    beforeEach(function () {
      viewModel.attr('deferredSave', {});
    });

    it('sets for deferredSave a DeferredTransaction instance', function () {
      viewModel.initializeDeferredSave();
      expect(viewModel.attr('deferredSave')).toEqual(jasmine.any(
        GGRC.Utils.DeferredTransaction
      ));
    });

    describe('calls a DeferredTransaction constructor for deferredSave namely',
    function () {
      var args;
      var ARGS_ORDER;

      beforeAll(function () {
        ARGS_ORDER = {
          CALLBACK: 0,
          TIMEOUT: 1,
          SEQUENTIALLY: 2
        };
      });

      beforeEach(function () {
        spyOn(GGRC.Utils, 'DeferredTransaction');
        viewModel.initializeDeferredSave();
        args = GGRC.Utils.DeferredTransaction.calls.argsFor(0);
      });

      it('sets completeTransaction param as a function', function () {
        expect(
          args[ARGS_ORDER.CALLBACK]
        ).toEqual(jasmine.any(Function));
      });

      it('sets 1000ms execution delay with help timeout param', function () {
        var expectedResult = 1000;
        expect(
          args[ARGS_ORDER.TIMEOUT]
        ).toBe(expectedResult);
      });

      it('sets sequentially flag with true with help sequentially param',
      function () {
        var expectedResult = true;
        expect(
          args[ARGS_ORDER.SEQUENTIALLY]
        ).toBe(expectedResult);
      });

      describe('sets completeTransaction function which', function () {
        var completeTransaction;
        var resolveFunc;
        var rejectFunc;
        var dfd;

        beforeEach(function () {
          dfd = can.Deferred();
          completeTransaction = args[ARGS_ORDER.CALLBACK];
          viewModel.attr('instance', {
            save: jasmine.createSpy('save').and.returnValue(dfd)
          });
          resolveFunc = jasmine.createSpy('resolveFunc');
          rejectFunc = jasmine.createSpy('rejectFunc');
        });

        it('saves instance', function () {
          completeTransaction();
          expect(viewModel.attr('instance').save).toHaveBeenCalled();
        });

        it('calls passed resolve function if the saving was resolved',
        function (done) {
          dfd.resolve();
          completeTransaction(resolveFunc, rejectFunc);
          dfd.done(function () {
            expect(resolveFunc).toHaveBeenCalled();
            expect(rejectFunc).not.toHaveBeenCalled();
            done();
          });
        });

        it('calls passed reject function if the saving was rejected',
        function (done) {
          dfd.reject();
          completeTransaction(resolveFunc, rejectFunc);
          dfd.fail(function () {
            expect(rejectFunc).toHaveBeenCalled();
            expect(resolveFunc).not.toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  describe('onStateChange method()', function () {
    var event;
    var instance;
    var formSavedDfd;
    var refreshDfd;
    var saveDfd;

    beforeEach(function () {
      refreshDfd = can.Deferred();
      saveDfd = can.Deferred();
      formSavedDfd = can.Deferred();
      event = {
        state: 'New status',
        undo: true
      };
      instance = new can.Map({
        isPending: false,
        status: 'Status',
        previousStatus: 'Prev status',
        refresh: jasmine.createSpy('refresh').and.returnValue(refreshDfd),
        save: jasmine.createSpy('save').and.returnValue(saveDfd)
      });
      viewModel.attr({
        instance: instance,
        onStateChangeDfd: can.Deferred(),
        formState: {
          formSavedDeferred: formSavedDfd
        }
      });
    });

    it('sets deferred for onStateChangeDfd field', function () {
      var isDeferred;
      viewModel.onStateChange(event);
      isDeferred = can.isDeferred(
        viewModel.attr('onStateChangeDfd')
      );
      expect(isDeferred).toBe(true);
    });

    it('sets previousStatus for instance undefined if event.isUndo is true',
    function () {
      viewModel.onStateChange(event);
      expect(instance.attr('previousStatus')).toBeUndefined();
    });

    it('sets previousStatus for instance a status value if event.undo ' +
    'is false',
    function () {
      event.undo = false;
      viewModel.onStateChange(event);
      expect(
        instance.attr('previousStatus')
      ).toBe(
        instance.attr('status')
      );
    });

    it('sets isPending flag for instance to true', function () {
      viewModel.onStateChange(event);
      expect(instance.attr('isPending')).toBe(true);
    });

    describe('after resolving a formState.formSavedDeferred', function () {
      beforeEach(function () {
        formSavedDfd.resolve();
      });

      it('refreshes instance', function (done) {
        viewModel.onStateChange(event);
        formSavedDfd.then(function () {
          done();
        });
      });

      describe('after resolving a refresh operation', function () {
        var $fakeBody;

        beforeEach(function () {
          refreshDfd.resolve();
          $fakeBody = {
            trigger: jasmine.createSpy('trigger')
          };

          spyOn(window, '$').and.returnValue($fakeBody);
        });

        it('sets instance status to previous status if event.undo is true and ' +
        'previous status is not empty', function (done) {
          var expectedResult = instance.attr('previousStatus');
          viewModel.onStateChange(event);
          refreshDfd.then(function () {
            expect(instance.attr('status')).toBe(expectedResult);
            done();
          });
        });

        it('sets instance status to "In Progress" if event.undo is true and ' +
        'it does not exist ', function (done) {
          var expectedResult = 'In Progress';
          instance.removeAttr('previousStatus');
          viewModel.onStateChange(event);
          refreshDfd.then(function () {
            expect(instance.attr('status')).toBe(expectedResult);
            done();
          });
        });

        it('sets instance status to event.state if event.undo is false',
        function (done) {
          event.undo = false;
          viewModel.onStateChange(event);
          refreshDfd.then(function () {
            expect(instance.attr('status')).toBe(event.state);
            done();
          });
        });

        it('triggers flash hint message event if event.undo is false and ' +
        'instance status is "In Review"', function (done) {
          _.extend(event, {
            undo: false,
            state: 'In Review'
          });
          viewModel.onStateChange(event);
          refreshDfd.then(function () {
            expect($fakeBody.trigger).toHaveBeenCalled();
            done();
          });
        });

        it('saves instance after all actions', function (done) {
          viewModel.onStateChange(event);
          refreshDfd.then(function () {
            done();
          });
        });

        describe('after resolving a save operation', function () {
          beforeEach(function () {
            spyOn(viewModel, 'initializeFormFields');
            saveDfd.resolve();
          });

          it('sets isPending to false', function (done) {
            viewModel.onStateChange(event);
            saveDfd.then(function () {
              instance.attr('isPending', false);
              done();
            });
          });

          it('initializes form fields', function (done) {
            viewModel.onStateChange(event);
            saveDfd.then(function () {
              expect(viewModel.initializeFormFields).toHaveBeenCalled();
              done();
            });
          });

          it('resolves onStateChangeDfd', function (done) {
            viewModel.onStateChange(event);
            viewModel.attr('onStateChangeDfd').then(function () {
              done();
            });
          });
        });
      });
    });
  });

  describe('saveGlobalAttributes method()', function () {
    var event;
    var saveDfd;
    var CAUtils;
    var instance;

    beforeAll(function () {
      CAUtils = GGRC.Utils.CustomAttributes;
    });

    beforeEach(function () {
      saveDfd = can.Deferred();
      instance = {
        custom_attribute_values: [1, 2, 3],
        save: jasmine.createSpy('save').and.returnValue(saveDfd)
      };
      event = {
        globalAttributes: []
      };
      spyOn(CAUtils, 'applyChangesToCustomAttributeValue');
      viewModel.attr({
        instance: instance
      });
    });

    it('calls applyChangesToCustomAttributeValue util for CA with' +
    'instance.custom_attribute_values and event.globalAttributes', function () {
      var globalAttrs = event.globalAttributes;
      var caValues = viewModel.attr('instance.custom_attribute_values');

      viewModel.saveGlobalAttributes(event);
      expect(CAUtils.applyChangesToCustomAttributeValue)
        .toHaveBeenCalledWith(
          caValues,
          globalAttrs
        );
    });

    it('saves instance', function () {
      viewModel.saveGlobalAttributes(event);
      expect(instance.save).toHaveBeenCalled();
    });

    it('returns result of an instance saving', function () {
      var result = viewModel.saveGlobalAttributes(event);
      expect(result).toBe(saveDfd);
    });
  });

  describe('showRequiredInfoModal method()', function () {
    var event;
    var modalPropName;

    beforeEach(function () {
      var field = new can.Map({
        title: 'Perfect Title',
        type: 'Perfect Type',
        options: [],
        value: {},
        errorsMap: {
          error1: true,
          error2: false,
          error3: false
        }
      });
      modalPropName = 'modal';
      event = {
        field: field
      };
    });

    it('works identity if data is passed with help event.field or field param',
    function () {
      var thoughtEvent;
      var thoughtParam;

      viewModel.showRequiredInfoModal(event);
      thoughtEvent = viewModel.attr(modalPropName).serialize();
      viewModel.removeAttr(modalPropName);

      viewModel.showRequiredInfoModal({}, event.field);
      thoughtParam = viewModel.attr(modalPropName).serialize();

      expect(thoughtEvent).toEqual(thoughtParam);
    });

    it('calls can.batch.start before setting a modal', function () {

    });

    it('calls can.batch.stop after setting a modal', function () {

    });

    describe('sets modal.content namely', function () {
      var field;
      var getContent;

      beforeAll(function () {
        getContent = function (prop) {
          return viewModel.attr(modalPropName
            .concat('.content.')
            .concat(prop)
          );
        };
      });

      beforeEach(function () {
        field = event.field;
      });

      it('sets "options" field', function () {
        var prop = 'options';
        var expectedResult = field.attr(prop);

        viewModel.showRequiredInfoModal(event);

        expect(getContent(prop)).toBe(expectedResult);
      });

      it('sets "contextScope" field', function () {
        var prop = 'contextScope';
        var expectedResult = field;
        viewModel.showRequiredInfoModal(event);
        expect(getContent(prop)).toBe(expectedResult);
      });

      it('sets "fields" field', function () {
        var prop = 'fields';
        var errors = event.field.errorsMap;
        var expectedResult = can.Map.keys(errors)
          .map(function (error) {
            return errors[error] ? error : null;
          })
          .filter(function (errorCode) {
            return !!errorCode;
          });
        var result;

        viewModel.showRequiredInfoModal(event);
        result = getContent(prop).serialize();

        expect(result).toEqual(expectedResult);
      });

      it('sets "value" field', function () {
        var prop = 'value';
        var expectedResult = field.attr(prop);
        viewModel.showRequiredInfoModal(event);
        expect(getContent(prop)).toBe(expectedResult);
      });

      it('sets "title" field', function () {
        var prop = 'title';
        var expectedResult = field.attr(prop);
        viewModel.showRequiredInfoModal(event);
        expect(getContent(prop)).toBe(expectedResult);
      });

      it('sets "type" field', function () {
        var prop = 'type';
        var expectedResult = field.attr(prop);
        viewModel.showRequiredInfoModal(event);
        expect(getContent(prop)).toBe(expectedResult);
      });
    });

    describe('sets modal.modalTitle namely', function () {
      var errorsMap;
      var join;

      beforeEach(function () {
        errorsMap = event.field.attr('errorsMap');
        join = ' and ';
      });

      it('sets "Required" title if there are no errors', function () {
        var expectedResult = 'Required ';

        errorsMap.attr([], true);
        viewModel.showRequiredInfoModal(event);

        expect(viewModel.attr('modal.modalTitle')).toBe(expectedResult);
      });

      it('sets title to "Required {<capitalized requrement from errors map>}"' +
      'if filtered errors map has only one item', function () {
        var map = {error: true};
        var errorKey = _.keys(map)[0];
        var expectedResult = 'Required ' + can.capitalize(errorKey);

        errorsMap.attr(map, true);
        viewModel.showRequiredInfoModal(event);

        expect(viewModel.attr('modal.modalTitle')).toBe(expectedResult);
      });

      it('sets title to "Required {<capitalized requirements separated by ' +
      '" and " string>}" if filtered errors map has several items',
      function () {
        var expectedResult = 'Required ' + can.Map.keys(errorsMap)
          .map(function (error) {
            return errorsMap[error] ? error : null;
          })
          .filter(Boolean)
          .map(can.capitalize)
          .join(join);

        viewModel.showRequiredInfoModal(event);

        expect(viewModel.attr('modal.modalTitle')).toBe(expectedResult);
      });
    });

    describe('sets modal.state', function () {

    });
  });

  describe('init method()', function () {

  });

  describe(' method()', function () {

  });

  describe(' method()', function () {

  });

  describe(' method()', function () {

  });
});
