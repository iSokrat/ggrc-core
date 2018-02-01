/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  hasEmptyValue,
  isRequireAttachments,
  hasMissingEvidence,
} from '../custom-attribute-help-utils';
import CustomAttributeObject from '../custom-attribute-object';

describe('hasEmptyValue() function', () => {
  let caObject;

  beforeEach(function () {
    caObject = new CustomAttributeObject(
      new can.Map(),
      new can.Map(),
      new can.Map()
    );
  });

  describe('when type of custom attribute value is string', () => {
    it('returns true ca value is empty', function () {
      let result;
      caObject.value = '';
      result = hasEmptyValue(caObject);
      expect(result).toBe(true);
    });

    it('returns true if ca value contains only whitespace characters',
    function () {
      let result;
      caObject.value = '\t  \n  \t';
      result = hasEmptyValue(caObject);
      expect(result).toBe(true);
    });

    it('returns false if ca value is not empty', function () {
      let result;
      caObject.value = 'Some text...';
      result = hasEmptyValue(caObject);
      expect(result).toBe(false);
    });
  });

  it('returns true if value is falsy', function () {
    let result;
    caObject.value = null;
    result = hasEmptyValue(caObject);
    expect(result).toBe(true);
  });

  it('returns false if value is truthy', function () {
    let result;
    caObject.value = 12345;
    result = hasEmptyValue(caObject);
    expect(result).toBe(false);
  });
});

describe('isRequireAttachments() function', () => {
  let caObject;
  let caDef;

  beforeEach(function () {
    const instance = new can.Map();
    caDef = new can.Map();
    caObject = new CustomAttributeObject(instance, caDef);
  });

  describe('returns true', () => {
    it('if caObject requires comment', function () {
      const commentRequired = '1';
      const optionName = 'Option name';
      let result;

      caObject.attachedComment = false;
      caDef.attr('multi_choice_mandatory', commentRequired);
      caDef.attr('multi_choice_options', optionName);

      result = isRequireAttachments(caObject, optionName);
      expect(result).toBe(true);
    });

    it('if caObject requires evidence', function () {
      const evidenceRequired = '2';
      const optionName = 'Option name';
      let result;

      caObject.attachedComment = false;
      caDef.attr('multi_choice_mandatory', evidenceRequired);
      caDef.attr('multi_choice_options', optionName);

      result = isRequireAttachments(caObject, optionName);
      expect(result).toBe(true);
    });
  });

  it('returns false by default', function () {
    const optionName = 'Option name';
    const result = isRequireAttachments(caObject, optionName);
    expect(result).toBe(false);
  });
});

fdescribe('hasMissingEvidence() function', () => {
  let caObject;
  let caDef;

  beforeEach(function () {
    const instance = new can.Map();
    caDef = new can.Map();
    caObject = new CustomAttributeObject(instance, caDef);
  });

  describe('when evidence is required', () => {
    beforeEach(function () {
      const evidenceRequired = '2';
      const optionName = 'Option name';

      caObject.attachedComment = false;
      caDef.attr('multi_choice_mandatory', evidenceRequired);
      caDef.attr('multi_choice_options', optionName);
    });

    it('...', function () {

    });
  });

  describe('when evidence is not required', () => {
    it('returns false', function () {
      const result = hasMissingEvidence(caObject, '');
      expect(result).toBe(false);
    });
  });
});
