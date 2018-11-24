/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  Proxy,
  Direct,
  Search,
  Multi,
  CustomFilter,
} from '../mappers/mapper-helpers';
import Mappings from './mappings';
import CustomAttributeDefinition from '../custom-attributes/custom-attribute-definition';
import AccessControlRole from '../custom-roles/access-control-role';
import {getRoleableModels} from '../../plugins/utils/models-utils';

const businessObjects = [
  'Assessment', 'AccessGroup', 'Audit', 'Contract', 'Control', 'DataAsset',
  'Document', 'Facility', 'Issue', 'Market', 'Metric', 'Objective', 'OrgGroup',
  'Policy', 'Process', 'Product', 'ProductGroup', 'Program', 'Project',
  'Regulation', 'Requirement', 'Risk', 'Standard', 'System',
  'TechnologyEnvironment', 'Threat', 'Vendor',
];

const coreObjects = _.difference(businessObjects,
  ['Assessment', 'Audit', 'Document', 'Program']);

const scopingObjects = [
  'AccessGroup', 'DataAsset', 'Facility', 'Market', 'Metric', 'OrgGroup',
  'Process', 'Product', 'ProductGroup', 'Project', 'System',
  'TechnologyEnvironment', 'Vendor',
];

const snapshotableObjects = GGRC.config.snapshotable_objects;

new Mappings({
  relatedMappings: {
    related: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },

  Person: {
    related: ['CycleTaskGroupObjectTask', 'TaskGroupTask', 'Workflow',
      ...getRoleableModels().map((model) => model.model_singular)],
  },

  Program: {
    map: [...coreObjects, 'Document'],
    related: ['Audit', 'Person', 'TaskGroup', 'Workflow'],
  },

  Document: {
    map: [...coreObjects, 'Program'],
    related: ['Person'],
  },

  // Core objects
  coreObjectsMappings: {
    _mixins: ['relatedMappings'],
    map: _.difference(businessObjects, ['Assessment']),
  },

  Issue: {
    map: [...coreObjects, 'Document', 'Program'],
    related: ['Assessment', 'Audit', 'Person', 'TaskGroup', 'Workflow'],
  },
  Contract: {
    _mixins: ['coreObjectsMappings'],
    map: _.difference(businessObjects, ['Assessment', 'Contract']),
  },
  Control: {
    _mixins: ['coreObjectsMappings'],
  },
  Objective: {
    _mixins: ['coreObjectsMappings'],
  },
  Policy: {
    _mixins: ['coreObjectsMappings'],
    map: _.difference(businessObjects, ['Assessment', 'Policy']),
  },
  Requirement: {
    _mixins: ['coreObjectsMappings'],
  },
  Regulation: {
    map: _.difference(businessObjects,
      [...scopingObjects, 'Assessment', 'Regulation']),
    related:
      [...scopingObjects, 'Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Risk: {
    _mixins: ['coreObjectsMappings'],
  },
  Standard: {
    map: _.difference(businessObjects,
      [...scopingObjects, 'Assessment', 'Standard']),
    related:
      [...scopingObjects, 'Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Threat: {
    _mixins: ['coreObjectsMappings'],
  },

  // Scoping objects
  scopingObjectsMappings: {
    map: _.difference(businessObjects,
      ['Assessment', 'Standard', 'Regulation']),
    related: ['Assessment', 'Person', 'Regulation', 'Standard', 'TaskGroup',
      'Workflow'],
  },
  AccessGroup: {
    _mixins: ['scopingObjectsMappings'],
    map: _.difference(businessObjects,
      ['Assessment', 'AccessGroup', 'Standard', 'Regulation']),
  },
  DataAsset: {
    _mixins: ['scopingObjectsMappings'],
  },
  Facility: {
    _mixins: ['scopingObjectsMappings'],
  },
  Market: {
    _mixins: ['scopingObjectsMappings'],
  },
  Metric: {
    _mixins: ['scopingObjectsMappings'],
  },
  OrgGroup: {
    _mixins: ['scopingObjectsMappings'],
  },
  Process: {
    _mixins: ['scopingObjectsMappings'],
  },
  Product: {
    _mixins: ['scopingObjectsMappings'],
  },
  ProductGroup: {
    _mixins: ['scopingObjectsMappings'],
  },
  Project: {
    _mixins: ['scopingObjectsMappings'],
  },
  System: {
    _mixins: ['scopingObjectsMappings'],
  },
  TechnologyEnvironment: {
    _mixins: ['scopingObjectsMappings'],
  },
  Vendor: {
    _mixins: ['scopingObjectsMappings'],
  },

  // Audit
  Audit: {
    map: [...snapshotableObjects, 'Issue'],
    related:
      ['Assessment', 'AssessmentTemplate', 'Evidence', 'Person', 'Program'],
  },
  Assessment: {
    map: [...snapshotableObjects, 'Issue'],
    related: ['Audit', 'Evidence', 'Person'],
  },
  Evidence: {
    related: ['Assessment', 'Audit', 'Person'],
  },
  AssessmentTemplate: {
    related: ['Audit'],
  },

  // Workflow
  TaskGroup: {
    map: [...coreObjects, 'Program'],
  },
  TaskGroupTask: {
    related: ['Person', 'Workflow'],
  },
  Workflow: {
    related: ['Person', 'TaskGroup', 'TaskGroupTask'],
  },
  CycleTaskGroupObjectTask: {
    // It is needed for an object list generation. This object list
    // describes which objects can be mapped to CycleTaskGroupObjectTask.
    // Types placed within this collection will be intersected
    // with TreeViewConfig.base_widgets_by_type["CycleTaskGroupObjectTask"]
    // collection. The result of the operation is the total list.
    map: [...coreObjects, 'Audit', 'Program'],
    related: ['Person'],
    // Needed for related_objects mapper
    related_objects_as_source: Proxy(
      null,
      'destination', 'Relationship',
      'source', 'related_destinations'
    ),
    // Needed for related_objects mapper
    related_objects_as_destination: Proxy(
      null,
      'source', 'Relationship',
      'destination', 'related_sources'
    ),
    // Needed to show mapped objects for CycleTaskGroupObjectTask
    related_objects: Multi(
      ['related_objects_as_source', 'related_objects_as_destination']
    ),
    /**
       * "cycle" mapper is needed for mapped objects under
       * CycleTaskGroupObjectTask into mapping-tree-view component.
       */
    cycle: Direct(
      'Cycle', 'cycle_task_group_object_tasks', 'cycle'),
    /**
       * This mapping name is needed for objects mapped to CTGOT.
       * It helps to filter results of objects mapped to CTGOT.
       * We can just remove some objects from results.
       */
    info_related_objects: CustomFilter(
      'related_objects',
      function (relatedObjects) {
        return !_.includes([
          'CycleTaskGroup',
          'Comment',
          'Document',
          'Person',
        ],
        relatedObjects.instance.type);
      }
    ),
  },

  // Other
  UserRole: {
    person: Direct('Person', 'user_roles', 'person'),
    role: Direct('Role', 'user_roles', 'role'),
  },
  MultitypeSearch: {
    map: [
      'AccessGroup', 'Assessment', 'AssessmentTemplate', 'Audit',
      'Contract', 'Control', 'CycleTaskGroupObjectTask', 'DataAsset',
      'Document', 'Evidence', 'Facility', 'Issue', 'Market', 'Metric',
      'Objective', 'OrgGroup', 'Person', 'Process', 'Product',
      'ProductGroup', 'Project', 'Policy', 'Program', 'Regulation',
      'Requirement', 'Risk', 'Standard', 'System', 'TaskGroup',
      'TaskGroupTask', 'TechnologyEnvironment', 'Threat',
      'Vendor', 'Workflow',
    ],
  },
  // Used by Custom Attributes widget
  CustomAttributable: {
    custom_attribute_definitions: Search(function (binding) {
      return CustomAttributeDefinition.findAll({
        definition_type: binding.instance.root_object,
        definition_id: null,
      });
    }, 'CustomAttributeDefinition'),
  },
  // used by the Custom Roles admin panel tab
  Roleable: {
    access_control_roles: Search(function (binding) {
      return AccessControlRole.findAll({
        object_type: binding.instance.model_singular,
        internal: false,
      });
    }, 'AccessControlRole'),
  },
});
