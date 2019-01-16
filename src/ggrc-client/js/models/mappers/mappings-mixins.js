/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import businessObjects from './mappings-types-collection';

export const coreObjectsMappings = {
  related: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  map: _.difference(businessObjects, ['Assessment']),
};

export const scopingObjectsMappings = {
  map: _.difference(businessObjects,
    ['Assessment', 'Standard', 'Regulation']),
  related: ['Assessment', 'Person', 'Regulation', 'Standard', 'TaskGroup',
    'Workflow'],
};
