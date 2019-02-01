/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './cycle-task-objects.mustache';
import Mappings from '../../../models/mappers/mappings';
import {loadObjectsByTypes} from '../../../plugins/utils/query-api-utils';

const viewModel = can.Map.extend({
  instance: null,
  mappedObjects: [],
  convertToMappedObjects(objects) {
    return objects.map((object) => ({
      object,
      iconClass: `fa-${_.snakeCase(object.type)}`,
    }));
  },
  async initMappedObjects() {
    const mappingTypes = Mappings.getMappingList('CycleTaskGroupObjectTask');
    const fields = ['type', 'title', 'viewLink', 'description', 'notes'];
    const rawMappedObjects = await loadObjectsByTypes(
      this.attr('instance'),
      mappingTypes,
      fields,
    );
    this.attr('mappedObjects').replace(this.convertToMappedObjects(
      rawMappedObjects
    ));
  },
});

const init = function () {
  this.viewModel.initMappedObjects();
};

export default can.Component.extend({
  tag: 'cycle-task-objects',
  template,
  viewModel,
  init,
});
