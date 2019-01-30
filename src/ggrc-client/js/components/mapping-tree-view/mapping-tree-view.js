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
    treeViewClass: '@',
    parentInstance: null,
    mappedObjects: [],
  },
  init(element) {
    _.forEach(['mapping', 'itemTemplate'], (prop) => {
      this.viewModel.attr(prop,
        $(element).attr(can.camelCaseToDashCase(prop))
      );
    });

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
