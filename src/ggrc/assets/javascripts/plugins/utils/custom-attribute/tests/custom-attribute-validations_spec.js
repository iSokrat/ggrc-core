/*
Copyright (C) 2018 Google Inc.
Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {hasEmptyMandatoryValue} from '../custom-attribute-validations';
import CustomAttributeObject from '../custom-attribute-object';

describe('hasEmptyMandatoryValue() function', () => {
  let injected;
  let caDef;

  beforeEach(function () {
    caDef = new can.Map();
    injected = {
      currentCaObject: new CustomAttributeObject(
        new can.Map(),
        caDef,
        new can.Map()
      ),
    };
  });

  describe('when passed current caObject has an empty value and is mandatory',
  () => {
    beforeEach(function () {
      injected.currentCaObject.value = null;
      caDef.attr('mandatory', true);
    });

    it('returns state where hasEmptyMandatoryValue equals to true',
    function () {
      const result = hasEmptyMandatoryValue(injected);
      expect(result.hasEmptyMandatoryValue).toBe(true);
    });
  });

  it('returns state where hasEmptyMandatoryValue equals to false by default',
  function () {
    const result = hasEmptyMandatoryValue(injected);
    expect(result.hasEmptyMandatoryValue).toBe(false);
  });
});
