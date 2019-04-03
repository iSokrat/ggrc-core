/*
    Copyright (C) 2019 Google Inc.
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

import {
  businessObjects,
  coreObjects,
  scopingObjects,
  snapshotableObjects,
  externalDirectiveObjects,
  externalBusinessObjects,
} from '../../plugins/models-types-collections';
import {getRoleableModels} from '../../plugins/utils/models-utils';

/*
  To configure a new mapping, use the following format :
  { <source object type> : {
      map : [ <object name>, ...]
      unmap : [ <object name>, ...]
      indirectMappings: [ <object name>, ...]
      mappers : {
        <mapping name> : Proxy(...) | Direct(...)
                      | Multi(...)
                      | CustomFilter(...),
      ...
      }
    }
  }

  <create> - models that cannot be mapped but can be created in scope of source
    object
  <map> - models that can be mapped to source object directly
    using object mapper
  <externalMap> - models that can be mapped only through external system
    not locally
  <unmap> - models that can be unmapped from source
  <indirectMappings> - models which cannot be directly mapped to object
    through Relationship but linked by another way. Currently used for Mapping
    Filter in Object mapper and Global Search
  <mappers> - custom mappings
*/

const roleableObjects = getRoleableModels()
  .map((model) => model.model_singular);

const createRule = {
  create: ['CycleTaskGroupObjectTask'],
};

const coreObjectConfig = {
  ...createRule,
  map: _.difference(businessObjects, ['Assessment']),
  unmap: _.difference(businessObjects, ['Assessment', 'Audit']),
  indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
};

const scopingObjectConfig = {
  ...createRule,
  map: _.difference(businessObjects,
    ['Assessment', ...externalBusinessObjects, ...externalDirectiveObjects]),
  externalMap: [...externalBusinessObjects, ...externalDirectiveObjects],
  unmap: _.difference(businessObjects, ['Assessment', 'Audit']),
  indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
};

new Mappings({
  Person: {
    indirectMappings: ['CycleTaskGroupObjectTask', 'TaskGroupTask', 'Workflow',
      ...roleableObjects],
  },

  Program: {
    create: ['Audit', 'CycleTaskGroupObjectTask'],
    map: [...coreObjects, 'Program', 'Document'],
    unmap: [...coreObjects, 'Program', 'Document'],
    indirectMappings: ['Person', 'TaskGroup', 'Workflow'],
  },

  Document: {
    map: [...coreObjects, 'Program'],
    unmap: [...coreObjects, 'Program'],
    indirectMappings: ['Person'],
  },

  // Core objects
  Issue: {
    ...createRule,
    map: [...coreObjects, 'Document', 'Program'],
    // mapping audit and assessment to issue is not allowed,
    // but unmapping possible
    unmap: [...coreObjects, 'Assessment', 'Audit', 'Document', 'Program'],
    indirectMappings: ['Assessment', 'Audit', 'Person', 'TaskGroup',
      'Workflow'],
  },
  Contract: {
    ...createRule,
    map: _.difference(businessObjects, ['Assessment', 'Contract']),
    unmap: _.difference(businessObjects, ['Assessment', 'Audit', 'Contract']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Control: {
    ...createRule,
    map: _.difference(businessObjects,
      ['Assessment', ...scopingObjects, ...externalDirectiveObjects, 'Risk']),
    externalMap: [...scopingObjects, ...externalDirectiveObjects, 'Risk'],
    unmap: _.difference(businessObjects, ['Assessment', 'Audit']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Objective: {
    ...coreObjectConfig,
  },
  Policy: {
    ...createRule,
    map: _.difference(businessObjects, ['Assessment', 'Policy']),
    unmap: _.difference(businessObjects, ['Assessment', 'Audit', 'Policy']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Requirement: {
    ...coreObjectConfig,
  },
  Regulation: {
    ...createRule,
    map: _.difference(businessObjects,
      [...scopingObjects, 'Assessment', 'Regulation',
        ...externalBusinessObjects]),
    externalMap: [...scopingObjects, ...externalBusinessObjects],
    unmap: _.difference(businessObjects,
      ['Assessment', 'Audit', 'Regulation']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Risk: {
    ...createRule,
    map: _.difference(businessObjects, ['Assessment',
      ...scopingObjects,
      ...externalDirectiveObjects, 'Control']),
    externalMap: [...scopingObjects, ...externalDirectiveObjects, 'Control'],
    unmap: _.difference(businessObjects, ['Assessment', 'Audit']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Standard: {
    ...createRule,
    map: _.difference(businessObjects,
      [...scopingObjects, 'Assessment', 'Standard',
        ...externalBusinessObjects]),
    externalMap: [...scopingObjects, ...externalBusinessObjects],
    unmap: _.difference(businessObjects,
      ['Assessment', 'Audit', 'Standard']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  Threat: {
    ...coreObjectConfig,
  },

  // Scoping objects
  AccessGroup: {
    ...createRule,
    map: _.difference(businessObjects,
      ['Assessment', 'AccessGroup',
        ...externalBusinessObjects,
        ...externalDirectiveObjects,
      ]),
    externalMap: [...externalBusinessObjects, ...externalDirectiveObjects],
    unmap: _.difference(businessObjects,
      ['Assessment', 'AccessGroup', 'Audit']),
    indirectMappings: ['Assessment', 'Person', 'TaskGroup', 'Workflow'],
  },
  AccountBalance: {
    ...scopingObjectConfig,
  },
  DataAsset: {
    ...scopingObjectConfig,
  },
  Facility: {
    ...scopingObjectConfig,
  },
  KeyReport: {
    ...scopingObjectConfig,
  },
  Market: {
    ...scopingObjectConfig,
  },
  Metric: {
    ...scopingObjectConfig,
  },
  OrgGroup: {
    ...scopingObjectConfig,
  },
  Process: {
    ...scopingObjectConfig,
  },
  Product: {
    ...scopingObjectConfig,
  },
  ProductGroup: {
    ...scopingObjectConfig,
  },
  Project: {
    ...scopingObjectConfig,
  },
  System: {
    ...scopingObjectConfig,
  },
  TechnologyEnvironment: {
    ...scopingObjectConfig,
  },
  Vendor: {
    ...scopingObjectConfig,
  },

  // Audit
  Audit: {
    create: ['Assessment', 'AssessmentTemplate', 'CycleTaskGroupObjectTask'],
    map: [...snapshotableObjects, 'Issue'],
    unmap: ['Issue'],
    indirectMappings: ['Evidence', 'Person', 'Program'],
  },
  Assessment: {
    map: [...snapshotableObjects, 'Issue'],
    unmap: [...snapshotableObjects, 'Issue'],
    indirectMappings: ['Audit', 'Evidence', 'Person'],
  },
  Evidence: {
    indirectMappings: ['Assessment', 'Audit', 'Person'],
  },
  AssessmentTemplate: {
    indirectMappings: ['Audit'],
  },

  // Workflow
  TaskGroup: {
    map: [...coreObjects, 'Program'],
    unmap: [...coreObjects, 'Program'],
    indirectMappings: ['Workflow'],
  },
  TaskGroupTask: {
    indirectMappings: ['Person', 'Workflow'],
  },
  Workflow: {
    indirectMappings: ['Person', 'TaskGroup', 'TaskGroupTask'],
  },
  CycleTaskGroupObjectTask: {
    map: [...coreObjects, 'Audit', 'Program'],
    unmap: [...coreObjects, 'Audit', 'Program'],
    indirectMappings: ['Person', 'Workflow'],

    mappers: {
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
       * CycleTaskGroupObjectTask into cycle-task-objects component.
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
  },

  // Other
  UserRole: {
    mappers: {
      person: Direct('Person', 'user_roles', 'person'),
      role: Direct('Role', 'user_roles', 'role'),
    },
  },
  MultitypeSearch: {
    map: [
      'AccessGroup', 'AccountBalance', 'Assessment', 'AssessmentTemplate',
      'Audit', 'Contract', 'Control', 'CycleTaskGroupObjectTask', 'DataAsset',
      'Document', 'Evidence', 'Facility', 'Issue', 'KeyReport', 'Market',
      'Metric', 'Objective', 'OrgGroup', 'Person', 'Process', 'Product',
      'ProductGroup', 'Project', 'Policy', 'Program', 'Regulation',
      'Requirement', 'Risk', 'Standard', 'System', 'TaskGroup',
      'TaskGroupTask', 'TechnologyEnvironment', 'Threat',
      'Vendor', 'Workflow',
    ],
  },
  // Used by Custom Attributes widget
  CustomAttributable: {
    mappers: {
      custom_attribute_definitions: Search(function (binding) {
        return CustomAttributeDefinition.findAll({
          definition_type: binding.instance.root_object,
          definition_id: null,
        });
      }, 'CustomAttributeDefinition'),
    },
  },
  // used by the Custom Roles admin panel tab
  Roleable: {
    mappers: {
      access_control_roles: Search(function (binding) {
        return AccessControlRole.findAll({
          object_type: binding.instance.model_singular,
          internal: false,
        });
      }, 'AccessControlRole'),
    },
  },
});
