/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './mapping-tree-view.mustache';
import Mappings from '../../models/mappers/mappings';

export default can.Component.extend({
  tag: 'mapping-tree-view',
  template,
  viewModel: {
    parentInstance: null,
    mappedObjects: [],
  },
  init(element) {
    this.viewModel.attr('mapping', $(element).attr('mapping'));

    Mappings
      .getBinding(
        this.viewModel.mapping,
        this.viewModel.parentInstance
      ).refresh_instances()
      .then((mappedObjects) => {
        this.viewModel.attr('mappedObjects').replace(mappedObjects);
      });
  },
});
