/*
 Copyright (C) 2017 Google Inc.
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
 * Enum for custom attriubte types.
 * @readonly
 * @enum {Symbol}
 */
export const CUSTOM_ATTRIBUTE_TYPE = Object.freeze({
  LOCAL: Symbol('LOCAL'),
  GLOBAL: Symbol('GLOBAL'),
});
