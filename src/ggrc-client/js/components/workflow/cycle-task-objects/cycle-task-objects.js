/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './cycle-task-objects.mustache';
import Mappings from '../../../models/mappers/mappings';

const viewModel = can.Map.extend({
  parentInstance: null,
  mappedObjects: [],
});

const init = function (element) {
  this.viewModel.attr('mapping', $(element).attr('mapping'));

  Mappings
    .getBinding(
      this.viewModel.mapping,
      this.viewModel.parentInstance
    ).refresh_instances()
    .then((mappedObjects) => {
      this.viewModel.attr('mappedObjects').replace(mappedObjects);
    });
};

export default can.Component.extend({
  tag: 'cycle-task-objects',
  template,
  viewModel,
  init,
});
