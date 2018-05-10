/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Component from '../task-list';
import {getComponentVM} from '../../../../../js_specs/spec_helpers';
import Permission from '../../../../permission';
import {REFRESH_RELATED} from '../../../../events/eventTypes';

describe('task-list component', () => {
  let viewModel;

  beforeEach(function () {
    viewModel = getComponentVM(Component);
  });

  describe('showCreateTaskButton attribute', () => {
    describe('get() method', () => {
      beforeEach(function () {
        viewModel.attr('baseInstance', {});
      });

      describe('returns false', () => {
        it('when there are no "update" permissions for the passed task group',
          function () {
            spyOn(Permission, 'is_allowed_for').and.returnValue(false);
            const result = viewModel.attr('showCreateTaskButton');
            expect(result).toBe(false);
            expect(Permission.is_allowed_for).toHaveBeenCalledWith(
              'update',
              viewModel.attr('baseInstance')
            );
          });

        it('when appropriate workflow is inactive', function () {
          viewModel.attr('workflow', {status: false});
          expect(viewModel.attr('showCreateTaskButton')).toBe(false);
        });
      });
    });
  });

  describe('updatePagingAfterCreate()', () => {
    beforeEach(function () {
      viewModel.attr('baseInstance', {});
      viewModel.attr('paging.count', 10);
    });

    describe('when page is not first', () => {
      beforeEach(function () {
        viewModel.attr('paging.current', 3);
      });

      it('sets first page for pagination', function () {
        viewModel.updatePagingAfterCreate();
        expect(viewModel.attr('paging.current')).toBe(1);
      });
    });

    describe('when page is first', () => {
      beforeEach(function () {
        viewModel.attr('paging.current', 1);
      });

      it('dispatches REFRESH_RELATED event for base instance with ' +
      'relatedItemsType model', function () {
        const dispatch = spyOn(viewModel.baseInstance, 'dispatch');
        const type = 'ModelName';
        viewModel.attr('relatedItemsType', type);
        viewModel.updatePagingAfterCreate();
        expect(dispatch).toHaveBeenCalledWith({
          ...REFRESH_RELATED,
          model: type,
        });
      });
    });
  });

  describe('updatePagingAfterDestroy() method', () => {
    beforeEach(function () {
      viewModel.attr('baseInstance', {});
    });

    describe('if current page is not first and has only one item', () => {
      beforeEach(function () {
        viewModel.attr('paging.count', 10);
        viewModel.attr('paging.current', 10);
        viewModel.attr('items', [{}]);
      });

      it('sets previous page', function () {
        const expected = viewModel.attr('paging.current') - 1;
        viewModel.updatePagingAfterDestroy();
        expect(viewModel.attr('paging.current')).toBe(expected);
      });
    });

    describe('if current page is first', () => {
      it('dispatches REFRESH_RELATED event for base instance with ' +
      'relatedItemsType model', function () {
        const dispatch = spyOn(viewModel.baseInstance, 'dispatch');
        const type = 'ModelName';
        viewModel.attr('relatedItemsType', type);
        viewModel.updatePagingAfterDestroy();
        expect(dispatch).toHaveBeenCalledWith({
          ...REFRESH_RELATED,
          model: type,
        });
      });
    });
  });

  describe('events', () => {
    let events;
    let staticVmProps;

    beforeEach(function () {
      events = Component.prototype.events;
      staticVmProps = Component.prototype.viewModel;
    });

    fdescribe('"{CMS.Models.${viewModel.relatedItemsType}} created"() event', () => {
      let handler;
      let eventsScope;

      beforeEach(function () {
        eventsScope = {viewModel};

        handler = events[`{CMS.Models.${staticVmProps.relatedItemsType}} created`]
          .bind(eventsScope);
      });

      describe('if passed instance has "relatedItemsType" type then', () => {
        let instance;
        let origRelatedItemsType;

        beforeEach(function () {
          origRelatedItemsType = staticVmProps.relatedItemsType;
          staticVmProps.relatedItemsType = 'TestType';
          can.Model.Cacheable.extend(`CMS.Models.${staticVmProps.relatedItemsType}`, {});
          instance = new CMS.Models[staticVmProps.relatedItemsType];
        });

        afterEach(function () {
          staticVmProps.relatedItemsType = origRelatedItemsType;
        });

        it('updates items of the page', function () {
          const update = spyOn(viewModel, 'updatePagingAfterCreate');
          handler({}, {}, instance);
          expect(update).toHaveBeenCalled();
        });
      });
    });

    describe('"{CMS.Models.${RELATED_ITEMS_TYPE}} destroyed"() event', () => {
      let handler;
      let eventsScope;

      beforeEach(function () {
        eventsScope = {viewModel};
        handler = events[`{CMS.Models.${RELATED_ITEMS_TYPE}} destroyed`]
          .bind(eventsScope);
      });

      describe('if passed instance has "RELATED_ITEMS_TYPE" type then', () => {
        let instance;

        beforeEach(function () {
          instance = new CMS.Models[RELATED_ITEMS_TYPE];
        });

        it('updates items of the page', function () {
          const update = spyOn(viewModel, 'updatePagingAfterDestroy');
          handler({}, {}, instance);
          expect(update).toHaveBeenCalled();
        });
      });
    });
  });
});
