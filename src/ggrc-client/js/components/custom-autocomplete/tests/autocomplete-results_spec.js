/*
 Copyright (C) 2018 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import baseAutocompleteResults from '../autocomplete-results';

describe('autocomplete-results viewModel', () => {
  let viewModel;

  beforeEach(()=> {
    viewModel = baseAutocompleteResults();
  });

  describe('_items get() method', () => {
    it('should return array objects for "items" attribute', () => {
      const fakeData = [
        {name: 'zxc'},
        {name: 'asd'},
        {name: 'qwert'},
      ];
      const results = [
        {name: 'zxc', _index: 0},
        {name: 'asd', _index: 1},
        {name: 'qwert', _index: 2},
      ];

      viewModel.attr('items', fakeData);

      const values = viewModel.attr('_items');

      values.forEach((item, index) => {
        expect(item).toEqual(jasmine.objectContaining(results[index]));
      });
    });
  });

  describe('addNewItem() method', () => {
    beforeEach(() => {
      spyOn(viewModel, 'dispatch');
      spyOn(viewModel, 'hide');
    });

    it('should dispatch "addNewItem" event', () => {
      const value = 'f';
      viewModel.attr('currentValue', value);

      viewModel.addNewItem();

      expect(viewModel.dispatch).toHaveBeenCalledWith({
        type: 'addNewItem',
        newValue: value,
      });
    });

    it('should call "hide" method', () => {
      const value = 'f';
      viewModel.attr('currentValue', value);

      viewModel.addNewItem();

      expect(viewModel.hide).toHaveBeenCalled();
    });
  });

  describe('selectItem() method', () => {
    it('should dispatch "selectItem" event', () => {
      const items = ['1', '2', '3'];
      const index = 0;

      spyOn(viewModel, 'dispatch');

      viewModel.attr('items', items);
      viewModel.selectItem(index);

      expect(viewModel.dispatch).toHaveBeenCalledWith({
        type: 'selectItem',
        item: items[index],
      });
    });

    it('should call "hide" method', () => {
      const items = ['1', '2', '3'];
      const index = 0;

      spyOn(viewModel, 'hide');

      viewModel.attr('items', items);
      viewModel.selectItem(index);

      expect(viewModel.hide).toHaveBeenCalled();
    });
  });

  describe('hide() method', () => {
    it('should clear "currentValue"', () => {
      viewModel.attr('currentValue', 'asd');

      viewModel.hide();

      const currentValue = viewModel.attr('currentValue');

      expect(currentValue).toEqual('');
    });

    it('should set "showResults" to false', () => {
      viewModel.attr('showResults', true);

      viewModel.hide();

      const showResults = viewModel.attr('showResults');

      expect(showResults).toEqual(false);
    });
  });
});
