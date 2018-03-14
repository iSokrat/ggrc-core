/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Component from '../bulk-update-target-state.js';

let objectStateToWarningMap = {
  CycleTaskGroupObjectTask: {
    'In Progress': 'Please be aware that Finished, Declined and Verified ' +
      'tasks cannot be moved to In Progress state.',
    Finished: 'Please be aware that Assigned and Verified ' +
      'tasks cannot be moved to Finished state.',
    Declined: 'Please be aware that Assigned, In Progress and Verified ' +
      'tasks cannot be moved to Declined state.',
    Verified: 'Please be aware that Assigned, In Progress and Declined ' +
      'tasks cannot be moved to Verified state.',
  },
};
let viewModel;

describe('GGRC.Components.bulkUpdateTargetState', function () {
  beforeAll(function () {
    viewModel = new (can.Map.extend(Component.prototype.viewModel));
  });
  describe('warningMessage property', function () {
    it('should return appropriate warnings for objects', function () {
      let objectStatesMap = {
        CycleTaskGroupObjectTask: ['Assigned', 'In Progress', 'Finished',
          'Declined', 'Deprecated', 'Verified'],
      };

      _.forEach(objectStatesMap, function (states, obj) {
        viewModel.attr('modelName', obj);

        _.forEach(states, function (state) {
          let warning;
          let expected = objectStateToWarningMap[obj][state] || '';
          viewModel.attr('targetState', state);

          warning = viewModel.attr('warningMessage');

          expect(warning).toEqual(expected);
        });
      });
    });
  });
});
