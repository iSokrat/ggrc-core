/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './templates/tree-item-custom-attribute.mustache';

import {CONTROL_TYPE} from '../../plugins/utils/control-utils';

var viewModel = can.Map.extend({
  instance: null,
  customAttributeId: null,
});

var helpers = {
  /*
    Used to get the string value for custom attributes
  */
  get_custom_attr_value: function (instance, customAttributeId, options) {
    let caObject;
    let value = '';
    const formatValueMap = {
      [CONTROL_TYPE.CHECKBOX](caObject) {
        return caObject.value ? 'Yes' : 'No';
      },
      [CONTROL_TYPE.DATE](caObject) {
        const date = caObject.value === ''
          ? null
          : caObject.value;

        return GGRC.Utils.formatDate(date, true);
      },
      [CONTROL_TYPE.PERSON](caObject) {
        var attr = caObject.attributeObject;
        return options.fn(options.contexts.add({
          object: attr ?
            attr.reify() :
            null,
        }));
      },
    };

    instance = Mustache.resolve(instance);
    customAttributeId = Mustache.resolve(customAttributeId);
    caObject = instance.customAttr(customAttributeId);
    value = _.has(formatValueMap, caObject.attributeType)
      ? formatValueMap[caObject.attributeType](caObject)
      : caObject.value;

    return value || '';
  },
};

GGRC.Components('treeItemCustomAttribute', {
  tag: 'tree-item-custom-attribute',
  template: template,
  viewModel: viewModel,
  helpers: helpers,
});

export default helpers;
