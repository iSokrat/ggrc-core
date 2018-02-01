/*
Copyright (C) 2018 Google Inc.
Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CustomAttributeObject from '../custom-attribute-object';
import {caDefTypeName} from '../custom-attribute-config';
import {CONTROL_TYPE} from '../../control-utils.js';
import {CUSTOM_ATTRIBUTE_TYPE} from './../custom-attribute-config';
import StateValidator from '../../state-validator-utils';

describe('CustomAttributeObject module', () => {
  let caObject;
  let instance;
  let caDef;
  let caValue;

  beforeEach(function () {
    instance = new can.Map();
    caDef = new can.Map();
    caValue = new can.Map();
    caObject = new CustomAttributeObject(instance, caDef, caValue);
  });

  describe('constructor', () => {
    it('sets instance for caObject', function () {
      const instance = new can.Map();
      const caObject = new CustomAttributeObject(
        instance,
        new can.Map()
      );
      expect(caObject._instance).toBe(instance);
    });

    it('sets custom attribute definition for caObject', function () {
      const caDef = new can.Map();
      const caObject = new CustomAttributeObject(
        new can.Map(),
        caDef
      );
      expect(caObject._caDefinition).toBe(caDef);
    });

    describe('calls _setupCaValue() method', () => {
      let _setupCaValue;

      beforeEach(function () {
        _setupCaValue = spyOn(CustomAttributeObject.prototype, '_setupCaValue')
          .and.callThrough();
      });

      it('with empty can.Map if caValue was not passed via params',
      function () {
        let caObject;
        let caValue;

        _setupCaValue.and.stub();
        caObject = new CustomAttributeObject(
          new can.Map(),
          new can.Map()
        );
        caValue = caObject._setupCaValue.calls.argsFor(0)[0];

        expect(caValue).toEqual(jasmine.any(can.Map));
        expect(caValue.attr()).toEqual({});
      });

      it('with passed caValue if it was provided', function () {
        const caValue = new can.Map({
          field1: 1,
          field2: 2,
        });
        const caObject = new CustomAttributeObject(
          new can.Map(),
          new can.Map(),
          caValue
        );
        expect(caObject._setupCaValue).toHaveBeenCalledWith(caValue);
      });
    });

    it('calls _buildStateValidator() method', function () {
      let caObject;
      spyOn(CustomAttributeObject.prototype, '_buildStateValidator');
      caObject = new CustomAttributeObject(
        new can.Map(),
        new can.Map()
      );
      expect(caObject._buildStateValidator).toHaveBeenCalled();
    });
  });

  describe('value getter', () => {
    describe('when caObject has checkbox type', function () {
      it('returns true if custom attribute value equals to "1"', function () {
        caDef.attr('attribute_type', caDefTypeName.Checkbox);
        caObject.value = '1';
        expect(caObject.value).toBe(true);
      });

      it('returns false if custom attribute value does not equal to "1"',
      function () {
        caDef.attr('attribute_type', caDefTypeName.Checkbox);
        caObject.value = '0';
        expect(caObject.value).toBe(false);
      });
    });

    it('returns custom attribute value', function () {
      const value = 'Some ca value';
      caValue.attr('attribute_value', value);
      expect(caObject.value).toBe(value);
    });
  });

  describe('value setter', () => {
    it('sets custom attribute value to prepared value from param ' +
    'method', function () {
      const value = 'Value before preparing';
      const preparedValue = 'Value after preparing';
      const prepare = spyOn(caObject, '_prepareAttributeValue')
        .and.returnValue(preparedValue);
      caObject.value = value;
      expect(prepare).toHaveBeenCalledWith(value);
      expect(caValue.attr('attribute_value')).toBe(preparedValue);
    });
  });

  describe('customValueId getter', () => {
    it('returns custom attribute id', function () {
      const id = 100;
      caValue.attr('id', id);
      expect(caObject.customValueId).toBe(id);
    });
  });

  describe('title getter', () => {
    it('returns custom attribute title', function () {
      const title = 'Title';
      caDef.attr('title', title);
      expect(caObject.title).toBe(title);
    });
  });

  describe('placeholder getter', () => {
    it('returns custom attribute placeholder', function () {
      const placeholder = 'Some placeholder...';
      caDef.attr('placeholder', placeholder);
      expect(caObject.placeholder).toBe(placeholder);
    });
  });

  describe('helptext getter', () => {
    it('returns custom attribute help text', function () {
      const helptext = 'Some help text...';
      caDef.attr('helptext', helptext);
      expect(caObject.helptext).toBe(helptext);
    });
  });

  describe('customAttributeId getter', () => {
    it('returns custom attribute id', function () {
      const id = 12345;
      caDef.attr('id', id);
      expect(caObject.customAttributeId).toBe(id);
    });
  });

  describe('mandatory getter', () => {
    it('returns custom attribute mandatory state', function () {
      const mandatory = true;
      caDef.attr('mandatory', mandatory);
      expect(caObject.mandatory).toBe(mandatory);
    });
  });

  describe('attributeType getter', () => {
    it('returns custom attribute control type', function () {
      const attributeType = caDefTypeName.RichText;
      caDef.attr('attribute_type', attributeType);
      expect(caObject.attributeType).toBe(CONTROL_TYPE.TEXT);
    });
  });

  describe('attributeObject getter', () => {
    it('returns custom attribute object', function () {
      const attributeObject = new can.Map();
      caValue.attr('attribute_object', attributeObject);
      expect(caObject.attributeObject).toBe(attributeObject);
    });
  });

  describe('type getter', () => {
    it('returns CUSTOM_ATTRIBUTE_TYPE.GLOBAL if custom attribute is global',
    function () {
      caDef.attr('definition_id', null);
      expect(caObject.type).toBe(CUSTOM_ATTRIBUTE_TYPE.GLOBAL);
    });

    it('returns CUSTOM_ATTRIBUTE_TYPE.LOCAL if custom attribute is local',
    function () {
      caDef.attr('definition_id', 123);
      expect(caObject.type).toBe(CUSTOM_ATTRIBUTE_TYPE.LOCAL);
    });
  });

  describe('multiChoiceOptions getter', () => {
    it('returns an empty array if custom attribute does not have multi ' +
    'choice options', function () {
      caDef.attr('multi_choice_options', null);
      expect(caObject.multiChoiceOptions).toEqual([]);
    });

    it('returns a list with options if custom attribute has multi choice ' +
    'options', function () {
      const options = '1,2,3';
      const expectedOptions = options.split(',');
      caDef.attr('multi_choice_options', options);
      expect(caObject.multiChoiceOptions).toEqual(expectedOptions);
    });
  });

  describe('validator getter', () => {
    it('returns StateValidator object', function () {
      const sv = caObject.validator;
      expect(sv).toEqual(jasmine.any(StateValidator));
    });
  });

  describe('validationState getter', () => {
    it('returns validation state', function () {
      const state = new can.Map();
      caObject._validationState = state;
      expect(caObject.validationState).toBe(state);
    });
  });

  describe('validate() method', () => {
    it('updates validation state', function () {
      const {validator} = caObject;
      validator.addValidationActions(() => ({a: 1}));
      validator.addValidationActions(() => ({b: 2}));
      caObject.validate();
      expect(caObject.validationState.attr()).toEqual({
        a: 1,
        b: 2,
      });
    });
  });

  describe('__validationState setter', () => {
    it('updates _validationState field', function () {
      const state = {a: 123};
      caObject.__validationState = state;
      expect(caObject.validationState.attr()).toEqual(state);
    });
  });

  describe('_setupCaValue() method', () => {
    describe('when passed caValue does not have requiered', () => {
      let caValue;

      beforeEach(function () {
        caValue = new can.Map();
      });

      it('attribute_object field then set it to result ' +
      'of _prepareAttributeObject method', function () {
        const preparedObject = new can.Map();
        const prepareObject = spyOn(caObject, '_prepareAttributeObject')
        .and.returnValue(preparedObject);

        caValue.attr({attribute_value: '12345'});
        caObject._setupCaValue(caValue);

        expect(prepareObject).toHaveBeenCalledWith(
          caValue.attr('attribute_value')
        );
        expect(caValue.attr('attribute_object')).toBe(preparedObject);
      });

      it('attribute_value field then set it to result ' +
      'of _prepareAttributeValue method', function () {
        const preparedValue = '12345';
        const prepareValue = spyOn(caObject, '_prepareAttributeValue')
          .and.returnValue(preparedValue);

        caValue.attr({attribute_value: '12345'});
        caObject._setupCaValue(caValue);

        expect(prepareValue).toHaveBeenCalledWith(
          caValue.attr('attribute_value')
        );
        expect(caValue.attr('attribute_value')).toBe(preparedValue);
      });

      it('context field then set it to context owned by instance which ' +
      'contains current caObject data', function () {
        const context = new can.Map();
        instance.attr('context', context);
        caObject._setupCaValue(caValue);
        expect(caValue.attr('context')).toBe(context);
      });

      it('custom_attribute_id field then set it to id from custom attribute' +
      'definition', function () {
        const caId = 12345;
        caDef.attr('id', caId);
        caObject._setupCaValue(caValue);
        expect(caValue.attr('custom_attribute_id')).toBe(caId);
      });
    });

    it('sets _caValue to passed caValue object', function () {
      const caValue = new can.Map();
      caObject._setupCaValue(caValue);
      expect(caObject._caValue).toBe(caValue);
    });
  });

  describe('_prepareAttributeValue() method', () => {
    it('returns "Person" string if custom attribute has ' +
    'caDefTypeName.MapPerson type', function () {
      let result;
      caDef.attr('attribute_type', caDefTypeName.MapPerson);
      result = caObject._prepareAttributeValue();
      expect(result).toBe('Person');
    });

    describe('when custom attribute has caDefTypeName.Checkbox type',
    () => {
      beforeEach(function () {
        caDef.attr('attribute_type', caDefTypeName.Checkbox);
      });

      describe('returns "1"', () => {
        it('if passed value equals to true', function () {
          const result = caObject._prepareAttributeValue(true);
          expect(result).toBe('1');
        });

        it('if passed value equals to "1"', function () {
          const result = caObject._prepareAttributeValue('1');
          expect(result).toBe('1');
        });
      });

      it('returns "0"', function () {
        const result = caObject._prepareAttributeValue();
        expect(result).toBe('0');
      });
    });

    it('returns passed value by default if custom attribute type is ' +
    'not recognizable', function () {
      const value = {};
      const result = caObject._prepareAttributeValue(value);
      expect(result).toBe(value);
    });
  });

  describe('_prepareAttributeObject() method', () => {
    it('returns a stub for the person if custom attribute has ' +
    'caDefTypeName.MapPerson type', function () {
      let result;
      const stub = {
        id: 12345,
        type: 'Person',
      };
      caDef.attr('attribute_type', caDefTypeName.MapPerson);
      result = caObject._prepareAttributeObject(stub.id);
      expect(result).toEqual(stub);
    });

    it('returns null by default if custom attribute type is ' +
    'not recognizable', function () {
      const result = caObject._prepareAttributeObject();
      expect(result).toBeNull();
    });
  });

  describe('_buildStateValidator() method', () => {
    it('creates inner state validator',
    function () {
      caObject._buildStateValidator();
      expect(caObject._validator).toEqual(jasmine.any(StateValidator));
    });

    it('injects itself inside created state validator', function (done) {
      const validateAction = ({currentCaObject}) =>
        currentCaObject === caObject
          ? done()
          : done.fail('Incorrect injection');

      caObject._buildStateValidator();
      caObject.validator.addValidationActions(validateAction);
      caObject.validate();
    });

    it('creates _validationState as an empty can.Map', function () {
      caObject._buildStateValidator();
      expect(caObject._validationState).toEqual(jasmine.any(can.Map));
      expect(caObject._validationState.attr()).toEqual({});
    });
  });
});
