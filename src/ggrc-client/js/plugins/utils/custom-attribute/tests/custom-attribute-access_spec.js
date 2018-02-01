/*
Copyright (C) 2018 Google Inc.
Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CustomAttributeAccess from '../custom-attribute-access';
import CustomAttributeObject from '../custom-attribute-object';
import {CUSTOM_ATTRIBUTE_TYPE} from '../custom-attribute-config';
import {hasEmptyMandatoryValue} from '../custom-attribute-validations';

describe('CustomAttributeAccess module', () => {
  let origCaAttrDefs;
  let caAccess;
  let instance;

  beforeEach(function () {
    origCaAttrDefs = GGRC.custom_attr_defs;
    GGRC.custom_attr_defs = [];
    instance = new can.Map();
    caAccess = new CustomAttributeAccess(instance);
  });

  afterEach(function () {
    GGRC.custom_attr_defs = origCaAttrDefs;
  });

  describe('constructor', () => {
    let instance;

    beforeEach(function () {
      instance = new can.Map();
    });

    it('sets _instance to passed instance', function () {
      const caAccess = new CustomAttributeAccess(instance);
      expect(caAccess._instance).toBe(instance);
    });

    it('calls _setupCaDefinitions method', function () {
      let caAccess;
      spyOn(
        CustomAttributeAccess.prototype,
        '_setupCaDefinitions'
      ).and.callThrough();
      caAccess = new CustomAttributeAccess(instance);
      expect(caAccess._setupCaDefinitions).toHaveBeenCalled();
    });

    it('calls _setupCaValues method', function () {
      let caAccess;
      spyOn(
        CustomAttributeAccess.prototype,
        '_setupCaValues'
      );
      caAccess = new CustomAttributeAccess(instance);
      expect(caAccess._setupCaValues).toHaveBeenCalled();
    });

    it('calls _setupCaObjects method', function () {
      let caAccess;
      spyOn(
        CustomAttributeAccess.prototype,
        '_setupCaObjects'
      );
      caAccess = new CustomAttributeAccess(instance);
      expect(caAccess._setupCaObjects).toHaveBeenCalled();
    });
  });

  describe('write() method', () => {
    let caObject;

    beforeEach(function () {
      const caDef = new can.Map();
      caObject = new CustomAttributeObject(instance, caDef);
      spyOn(caAccess, '_findCaObjectByCaId').and.returnValue(caObject);
    });

    it('finds caObject by custom attribute id', function () {
      const change = {
        caId: 1,
        value: 'Some text...',
      };
      caAccess.write(change);
      expect(caAccess._findCaObjectByCaId).toHaveBeenCalledWith(change.caId);
    });

    it('applies passed change to the appopriate caObject', function () {
      const change = {
        caId: 1,
        value: 'Some text...',
      };
      const apply = spyOn(caAccess, '_applyChangeToCaObject');
      caAccess.write(change);
      expect(apply).toHaveBeenCalledWith(caObject, change);
    });
  });

  describe('read() method', () => {
    describe('when was specified 0 params', () => {
      it('returns all custom attribute objects', function () {
        const expectedResult = caAccess._caObjects;
        const result = caAccess.read();
        expect(result).toBe(expectedResult);
      });
    });

    describe('when was specified 1 param', () => {
      describe('if param is object', () => {
        it('returns filtered custom attribute objects', function () {
          const expectedResult = [];
          const options = {type: CUSTOM_ATTRIBUTE_TYPE.GLOBAL};
          let result;
          spyOn(caAccess, '_getFilteredCaObjects').and.returnValue(
            expectedResult
          );
          result = caAccess.read(options);
          expect(caAccess._getFilteredCaObjects).toHaveBeenCalledWith(options);
          expect(result).toBe(expectedResult);
        });

        it('returns an empty can.List if there are no custom attribute objects',
          function () {
            const options = {type: CUSTOM_ATTRIBUTE_TYPE.GLOBAL};
            const result = caAccess.read(options);
            expect(result.attr()).toEqual([]);
          });
      });

      it('returns a custom attribute object with certain ca id', function () {
        const caId = 1234;
        const expectedResult = new CustomAttributeObject(
          new can.Map(),
          new can.Map()
        );
        let result;
        spyOn(caAccess, '_findCaObjectByCaId').and.returnValue(
          expectedResult
        );
        result = caAccess.read(caId);
        expect(caAccess._findCaObjectByCaId).toHaveBeenCalledWith(caId);
        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('_setupCaObjects() method', () => {
    it('binds ca definitions and values together forming caObjects',
      function () {
        const caDefs = [
          {
            id: 1,
            title: 'Some title 1...',
          },
          {
            id: 3,
            title: 'Some title 2...',
          },
          {
            id: 5,
            title: 'Some title 3...',
          },
        ];
        const caValues = [
          {
            custom_attribute_id: 5,
            attribute_value: 'Some text 3...',
          },
          {
            custom_attribute_id: 3,
            attribute_value: 'Some text 2...',
          },
          {
            custom_attribute_id: 1,
            attribute_value: 'Some text 1...',
          },
        ];
        let caObjects;
        instance.attr({
          custom_attribute_definitions: caDefs,
          custom_attribute_values: caValues,
        });
        caAccess._setupCaObjects();
        caObjects = caAccess.read();
        caObjects.forEach((caObject, index) => {
          const caDef = caDefs[index];
          const title = caDef.title;
          const value = caValues
            .find((caValue) => caValue.custom_attribute_id === caDef.id)
            .attribute_value;
          expect(caObject.value).toBe(value);
          expect(caObject.title).toBe(title);
        });
      });

    it('builds an empty custom attribute value objects for ca definitions' +
    'if these values do not exist', function () {
      let caObjects;
      instance.attr('custom_attribute_definitions', [
        {id: 1},
        {id: 2},
        {id: 3},
      ]);
      caAccess._setupCaObjects();
      caObjects = caAccess.read();
      caObjects.forEach((caObject) => {
        expect(caObject.value).toBe('');
      });
    });

    it('setups validations for each custom attribute object', function () {
      const setup = spyOn(caAccess, '_setupValidations');
      caAccess._setupCaObjects();
      expect(setup).toHaveBeenCalled();
    });

    it('validates each custom attribute object after setuping the validation' +
    'actions', function () {
      const caDefs = [
        {id: 1},
        {id: 2},
        {id: 3},
      ];
      const validate = spyOn(CustomAttributeObject.prototype, 'validate');
      instance.attr('custom_attribute_definitions', caDefs);
      caAccess._setupCaObjects();
      expect(validate.calls.count()).toBe(caDefs.length);
    });
  });

  describe('_setupValidations() method', () => {
    let caObjects;

    beforeEach(function () {
      caObjects = new can.List();
    });

    describe('for each caObject', () => {
      beforeEach(function () {
        const objects = Array.from(
          {length: 2},
          () => new CustomAttributeObject(new can.Map(), new can.Map())
        );
        caObjects.push(...objects);
      });

      describe('if caObject has CUSTOM_ATTRIBUTE_TYPE.GLOBAL type', () => {
        it('builds default validations for it', function () {
          const build = spyOn(caAccess, '_buildDefaultValidations');
          caAccess._setupValidations(caObjects);
          caObjects.forEach((caObject) => {
            expect(build).toHaveBeenCalledWith(caObject);
          });
        });
      });

      it('builds default validations by default', function () {
        const build = spyOn(caAccess, '_buildDefaultValidations');
        caAccess._setupValidations(caObjects);
        caObjects.forEach((caObject) => {
          expect(build).toHaveBeenCalledWith(caObject);
        });
      });
    });
  });

  describe('_buildDefaultValidations() method', () => {
    let caObject;

    beforeEach(function () {
      caObject = new CustomAttributeObject(
        new can.Map(),
        new can.Map()
      );
    });

    it('adds validations for checking for empty mandatory value', function () {
      const add = spyOn(caObject.validator, 'addValidationActions');
      caAccess._buildDefaultValidations(caObject);
      expect(add).toHaveBeenCalledWith(hasEmptyMandatoryValue);
    });
  });

  describe('_getFilteredCaObjects() method', () => {
    let options;

    beforeEach(function () {
      options = {};
    });

    it('returns an empty list if tehere are no custom atttribute objects',
      function () {
        const result = caAccess._getFilteredCaObjects(options);
        expect(result.attr()).toEqual([]);
      });

    it('returns a list with the filtered custom attribute objects by type',
      function () {
        let result;
        let isLocal;
        const caDefs = [
          {
            id: 1,
            definition_id: 345435,
          },
          {
            id: 2,
            definition_id: null,
          },
          {
            id: 3,
            definition_id: 234324,
          },
        ];
        const expectedResult = caDefs.filter((caDef) => caDef.definition_id);

        instance.attr('custom_attribute_definitions', caDefs);
        caAccess._setupCaObjects();
        result = caAccess._getFilteredCaObjects({
          type: CUSTOM_ATTRIBUTE_TYPE.LOCAL,
        });
        isLocal = _.every(result, (caObject) =>
          caObject.type === CUSTOM_ATTRIBUTE_TYPE.LOCAL
        );
        expect(result.length).toBe(expectedResult.length);
        expect(isLocal).toBe(true);
      });
  });

  describe('_setupCaValues() method', () => {
    describe('when there are no custom attribute values', () => {
      beforeEach(function () {
        instance.removeAttr('custom_attribute_values');
      });

      it('sets an empty list for them', () => {
        caAccess._setupCaValues();
        expect(instance.attr('custom_attribute_values').attr()).toEqual([]);
      });
    });
  });

  describe('_setupCaDefinitions() method', () => {
    describe('when there are no custom attribute definitions', () => {
      beforeEach(function () {
        instance.removeAttr('custom_attribute_definitions');
      });

      it('sets global custom attributes depending on definition type',
        function () {
          const caDefs = [{id: 234}, {id: 236}];
          const rootObject = 'Name of root object';
          const getGlobalCa = spyOn(caAccess, '_getGlobalCustomAttributes')
            .and.returnValue(caDefs);
          instance.constructor.root_object = rootObject;
          caAccess._setupCaDefinitions();
          expect(
            instance.attr('custom_attribute_definitions').attr()
          ).toEqual(caDefs);
          expect(getGlobalCa).toHaveBeenCalledWith(rootObject);
        });
    });
  });

  describe('_getGlobalCustomAttributes() method', () => {
    it('returns an empty list if there are no gca', function () {
      const result = caAccess._getGlobalCustomAttributes();
      expect(result).toEqual([]);
    });

    it('returns a list with global custom attributes which have certain type',
      function () {
        const definitionType = 'Type 1';
        const defs = [
          {
            definition_id: null,
            definition_type: definitionType,
          },
          {
            definition_id: null,
            definition_type: 'Type 2',
          },
          {
            definition_id: 453,
            definition_type: 'Type 2',
          },
          {
            definition_id: 123,
            definition_type: definitionType,
          },
        ];
        const expectedResult = defs.filter((gca) =>
          gca.definition_type === definitionType &&
          gca.definition_id === null
        );
        GGRC.custom_attr_defs.push(...defs);
        const result = caAccess._getGlobalCustomAttributes(definitionType);
        expect(result).toEqual(expectedResult);
      });
  });

  describe('_applyChangeToCaObject() method', () => {
    it('sets value for passed caObject from passed change object', function () {
      const caObject = new CustomAttributeObject(
        new can.Map(),
        new can.Map()
      );
      const change = {
        caId: 123,
        value: 'Some text...',
      };
      caAccess._applyChangeToCaObject(caObject, change);
      expect(caObject.value).toBe(change.value);
    });
  });

  describe('_findCaValueByCaId() method', () => {
    it('returns undefined if there is no needed caValue object', function () {
      const caValue = caAccess._findCaValueByCaId(1234);
      expect(caValue).toBeUndefined();
    });

    it('returns found caValue with passed custom attribute id', function () {
      const caId = 2;
      const value = 234;
      let caValue;
      instance.attr('custom_attribute_values', [
        {
          custom_attribute_id: 1,
          attribute_value: 123,
        },
        {
          custom_attribute_id: caId,
          attribute_value: value,
        },
        {
          custom_attribute_id: 3,
          attribute_value: 345,
        },
      ]);
      caValue = caAccess._findCaValueByCaId(caId);
      expect(caValue.attr('attribute_value')).toBe(value);
    });
  });

  describe('_findCaObjectByCaId() method', () => {
    it('returns undefined if there is no needed caObject object', function () {
      const caObject = caAccess._findCaObjectByCaId(1234);
      expect(caObject).toBeUndefined();
    });

    it('returns found caValue with passed custom attribute id', function () {
      const caId = 2;
      const title = 234;
      let caObject;
      instance.attr('custom_attribute_definitions', [
        {
          id: 1,
          title: 123,
        },
        {
          id: caId,
          title: title,
        },
        {
          id: 3,
          title: 345,
        },
      ]);
      caAccess._setupCaObjects();
      caObject = caAccess._findCaObjectByCaId(caId);
      expect(caObject.title).toBe(title);
    });
  });
});
