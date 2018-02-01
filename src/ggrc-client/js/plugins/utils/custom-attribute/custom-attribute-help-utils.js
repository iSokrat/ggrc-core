/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} has
 * an empty value.
 * @param {CustomAttributeObject} caObject - The custom attribute object.
 * @return {boolean} - true if caObject has an empty value else false.
 */
function hasEmptyValue(caObject) {
  const value = caObject.value;
  let isEmpty;

  switch (typeof value) {
    case 'string': {
      isEmpty = _.flow(_.trim, _.isEmpty)(value);
      break;
    }
    default: {
      isEmpty = Boolean(value) === false;
      break;
    }
  }

  return isEmpty;
}

export {
  hasEmptyValue,
};
