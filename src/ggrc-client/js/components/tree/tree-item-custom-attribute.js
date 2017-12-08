/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './templates/tree-item-custom-attribute.mustache';

import {CONTROL_TYPE} from '../../plugins/utils/control-utils';

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
  [CONTROL_TYPE.PERSON](caObject, options) {
    const attr = caObject.attributeObject;
    return options.fn(options.contexts.add({
      object: attr ?
        attr.reify() :
        null,
    }));
  },
};

/*
  Used to get the string value for custom attributes
*/
const getCustomAttrValue = (instance, customAttributeId, options) => {
  let caObject;
  let value = '';

  instance = Mustache.resolve(instance);
  customAttributeId = Mustache.resolve(customAttributeId);
  caObject = instance.customAttr(customAttributeId);

  if (caObject) {
    const hasHandler = _.has(formatValueMap, caObject.attributeType);
    let customAttrValue = caObject.value;

    if (hasHandler) {
      const handler = formatValueMap[caObject.attributeType];

      switch (caObject.attributeType) {
        case CONTROL_TYPE.PERSON:
          customAttrValue = handler(caObject, options);
          break;
        default:
          customAttrValue = handler(caObject);
      }
    }

    value = customAttrValue || '';
  }

  return value;
};

export const viewModel = can.Map.extend({
  instance: null,
  customAttributeId: null,
});

export const helpers = {
  getCustomAttrValue,
};

export default can.Component.extend({
  tag: 'tree-item-custom-attribute',
  template,
  viewModel,
  helpers,
});
