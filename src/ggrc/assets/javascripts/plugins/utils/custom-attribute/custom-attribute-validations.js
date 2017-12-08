/*
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  isRequireAttachments,
  hasMissingEvidence,
  hasMissingComment,
  hasEmptyValue,
} from './custom-attribute-help-utils';

/**
 * @typedef AttachRequirementsState
 * @property {boolean} hasRequiredAttachments - true if attachments is required
 * else false.
 */

/**
 * Returns the object with the state of the attachments requirement.
 * @param {Injection} injection
 * @param {CustomAttributeObject} injection.currentCaObject - Custom attribute object.
 * @return {AttachRequirementsState} - {@link AttachRequirementsState} object.
 */
function hasRequiredAttachments({currentCaObject}) {
  const requirementKey = currentCaObject.value;
  return {
    hasRequiredAttachments: isRequireAttachments(
      currentCaObject,
      requirementKey
    ),
  };
}

/**
 * @typedef MissingAttachachmentsState
 * @property {boolean} hasMissingComment - true if the comment is missing else false.
 * @property {boolean} hasMissingEvidence - true if the evidence is missing else false.
 * @property {boolean} hasMissingAttachments - true if the attachments is missing else false.
 */

/**
 * Returns the object with the state of the missing attachments.
 * @param {Injection} injection
 * @param {CustomAttributeObject} injection.currentCaObject - Verifiable custom attribute
 * object.
 * @param {CustomAttributeObjects[]} injection.allLocalCaObjects - Custom
 * attribute objects for comparation with evidences.
 * @param {can.List} injection.evidences - The set of evidences.
 * @return {MissingAttachachmentsState} - {@link MissingAttachachmentsState} object.
 */
function hasMissingAttachments({
  currentCaObject,
  allLocalCaObjects,
  evidences,
}) {
  const missingComment = hasMissingComment(currentCaObject);
  const missingEvidences = hasMissingEvidence(
    currentCaObject,
    allLocalCaObjects,
    evidences
  );

  return {
    hasMissingComment: missingComment,
    hasMissingEvidence: missingEvidences,
    hasMissingAttachments: (
      missingComment ||
      missingEvidences
    ),
  };
}

/**
 * @typedef EmptyMandatoryState
 * @property {boolean} hasEmptyMandatoryValue - true if the mandatory value is
 * empty else false.
 */

/**
 * Returns the object with the state of emptiness the mandatory value.
 * @param {Injection} injection
 * @param {CustomAttributeObject} injection.currentCaObject - Custom attribute object.
 * @return {EmptyMandatoryState} - {@link EmptyMandatoryState} object.
 */
function hasEmptyMandatoryValue({currentCaObject}) {
  let state = {
    hasEmptyMandatoryValue: false,
  };

  if (
    hasEmptyValue(currentCaObject) &&
    currentCaObject.mandatory
  ) {
    state.hasEmptyMandatoryValue = true;
  }

  return state;
}

export {
  hasMissingAttachments,
  hasEmptyMandatoryValue,
  hasRequiredAttachments,
};
