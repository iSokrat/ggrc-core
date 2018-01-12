/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

/**
 * Enum represents the requirements for custom attribute attachments.
 * @readonly
 * @enum {Symbol}
 */
export const CA_DD_REQUIRED_DEPS = Object.freeze({
  NONE: Symbol('None'),
  COMMENT: Symbol('Comment'),
  EVIDENCE: Symbol('Evidence'),
  COMMENT_AND_EVIDENCE: Symbol('Comment and evidence'),
});

/**
 * Enum represents the failed precondition type for custom attribute.
 * @readonly
 * @enum {Symbol}
 */
export const FAILED_PRECONDITION = Object.freeze({
  VALUE: Symbol('Value is missing'),
  COMMENT: Symbol('Comment isn\'t attached'),
  EVIDENCE: Symbol('Evidence isn\'t attached'),
});

/**
 * Enum for custom attriubte types.
 * @readonly
 * @enum {Symbol}
 */
export const CUSTOM_ATTRIBUTE_TYPE = Object.freeze({
  LOCAL: Symbol('LOCAL'),
  GLOBAL: Symbol('GLOBAL'),
});

/**
 * Has names of the back-end custom attribute control types.
 */
export const caDefTypeName = {
  Text: 'Text',
  RichText: 'Rich Text',
  MapPerson: 'Map:Person',
  Date: 'Date',
  Input: 'Input',
  Checkbox: 'Checkbox',
  Dropdown: 'Dropdown',
};
