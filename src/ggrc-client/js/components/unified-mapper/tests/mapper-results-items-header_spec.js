/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {getComponentVM} from '../../../../js_specs/spec_helpers';
import Component from '../mapper-results-items-header';

describe('mapper-results-items-header component', function () {
  'use strict';

  let viewModel;

  beforeEach(function () {
    viewModel = getComponentVM(Component);
  });

  describe('isSorted() method', function () {
    let attr = new can.Map({
      attr_sort_field: 'Title',
    });

    it('returns true if attr_sort_field equal to viewModel.sortKey',
      function () {
        let result;
        viewModel.attr('sortKey', 'Title');
        result = viewModel.isSorted(attr);
        expect(result).toEqual(true);
      });
    it('returns false if attr_sort_field not equal to viewModel.sortKey',
      function () {
        let result;
        viewModel.attr('sortKey', 'Date');
        result = viewModel.isSorted(attr);
        expect(result).toEqual(false);
      });
  });

  describe('isSortedAsc() method', function () {
    it('returns true if sorted by ascending', function () {
      let result;
      viewModel.attr('sortDirection', 'asc');
      result = viewModel.isSortedAsc();
      expect(result).toEqual(true);
    });
    it('returns true if sorted not by ascending', function () {
      let result;
      viewModel.attr('sortDirection', 'desc');
      result = viewModel.isSortedAsc();
      expect(result).toEqual(false);
    });
  });

  describe('applySort() method', function () {
    beforeEach(function () {
      viewModel.attr('sortKey', 'Title');
      viewModel.attr('sortDirection', 'asc');
    });

    it('toggles sort direction if sorted by current attribute',
      function () {
        let attr = new can.Map({
          attr_sort_field: 'Title',
        });
        viewModel.applySort(attr);
        expect(viewModel.attr('sortDirection')).toEqual('desc');
      });

    it('changes sortKey if sorted by another attribute',
      function () {
        let attr = new can.Map({
          attr_sort_field: 'State',
        });
        viewModel.applySort(attr);
        expect(viewModel.attr('sortKey')).toEqual('State');
      });

    it('sets sortDirection to "asc" if sorted by another attribute',
      function () {
        let attr = new can.Map({
          attr_sort_field: 'State',
        });
        viewModel.applySort(attr);
        expect(viewModel.attr('sortDirection')).toEqual('asc');
      });
  });

  describe('toggleSortDirection() method', function () {
    it('sets "sortDirection" to "desc" if sorted by "asc"',
      function () {
        viewModel.attr('sortDirection', 'asc');
        viewModel.toggleSortDirection();
        expect(viewModel.attr('sortDirection')).toEqual('desc');
      });

    it('sets "sortDirection" to "asc" if sorted by "desc"',
      function () {
        viewModel.attr('sortDirection', 'desc');
        viewModel.toggleSortDirection();
        expect(viewModel.attr('sortDirection')).toEqual('asc');
      });
  });
});
