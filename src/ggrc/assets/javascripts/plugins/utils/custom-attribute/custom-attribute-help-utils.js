/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {CA_DD_REQUIRED_DEPS} from './custom-attribute-config';
import {CONTROL_TYPE} from '../control-utils';

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

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} requires
 * attachments.
 * @param {CustomAttributeObject} caObject - The custom attribute object.
 * @param {string} requirementKey - The key for requirements.
 *  @see CustomAttributeObject~multiChoiceRequirements
 * @return {boolean} - true if caObject requires attachments else false.
 */
function isRequireAttachments(caObject, requirementKey) {
  return (
    isRequireComment(caObject, requirementKey) ||
    isRequireEvidence(caObject, requirementKey)
  );
}

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} requires
 * evidence.
 * @param {CustomAttributeObject} caObject - The custom attribute object.
 * @param {string} requirementKey - The key for requirements.
 *  @see CustomAttributeObject~multiChoiceRequirements
 * @return {boolean} - true if caObject requires evidence else false.
 */
function isRequireEvidence(caObject, requirementKey) {
  const requirement = caObject.multiChoiceRequirements[requirementKey];
  return (
    requirement === CA_DD_REQUIRED_DEPS.EVIDENCE ||
    requirement === CA_DD_REQUIRED_DEPS.COMMENT_AND_EVIDENCE
  );
}

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} requires
 * comment.
 * @param {CustomAttributeObject} caObject - The custom attribute object.
 * @param {string} requirementKey - The key for requirements.
 *  @see CustomAttributeObject~multiChoiceRequirements
 * @return {boolean} - true if caObject requires comment else false.
 */
function isRequireComment(caObject, requirementKey) {
  const mandatoryOption = caObject
    .multiChoiceRequirements[requirementKey];
  return (
    mandatoryOption === CA_DD_REQUIRED_DEPS.COMMENT ||
    mandatoryOption === CA_DD_REQUIRED_DEPS.COMMENT_AND_EVIDENCE
  );
}

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} has
 * missing evidences.
 * Returns true only in case if currentCaObject require evidence and total
 * count of passed evidences will be less then total count of custom attribute
 * objects with dropdown control type which requires attached evidence.
 * @param {CustomAttributeObject} currentCaObject - Verifiable custom attribute
 * object.
 * @param {CustomAttributeObjects[]} caObjects - Custom attribute objects
 * for comparation with evidences.
 * @param {can.List} evidences - The set of evidences.
 * @return {boolean} - true if caObject has missing evidence.
 */
function hasMissingEvidence(
  currentCaObject,
  caObjects = [],
  evidences = new can.List()
) {
  const requirementKey = currentCaObject.value;
  let result = false;

  if (isRequireEvidence(currentCaObject, requirementKey)) {
    let optionsWithEvidence = caObjects
      .filter((caObject) => caObject.attributeType === CONTROL_TYPE.DROPDOWN)
      .filter((caObject) => {
        const requirementKey = caObject.value;
        return isRequireEvidence(caObject, requirementKey);
      }).length;

    result = (optionsWithEvidence > evidences.length);
  }

  return result;
}

/**
 * Checks if the [custom attribute object]{@link CustomAttributeObject} has
 * missing comment.
 * @param {CustomAttributeObject} caObject - Verifiable custom attribute
 * object.
 * @return {boolean} - true if caObject has missing evidence.
 */
function hasMissingComment(caObject) {
  const requirementKey = caObject.value;
  return (
    isRequireComment(caObject, requirementKey) &&
    !caObject.hasAttachedComment
  );
}

export {
  isRequireAttachments,
  hasEmptyValue,
  hasMissingEvidence,
  hasMissingComment,
};
