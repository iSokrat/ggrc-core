/*
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import StateValidator from '../state-validator-utils';
import {
  CUSTOM_ATTRIBUTE_TYPE,
  CA_DD_REQUIRED_DEPS,
} from './custom-attribute-config';
import {CONTROL_TYPE} from '../control-utils.js';

/**
 * Represents relationships between custom attribute multi choice mandatory
 * options (represented in the back-end form) and appopriate constants.
 */
const caMultiChoiceMandatory = {
  '0': CA_DD_REQUIRED_DEPS.NONE,
  '1': CA_DD_REQUIRED_DEPS.COMMENT,
  '2': CA_DD_REQUIRED_DEPS.EVIDENCE,
  '3': CA_DD_REQUIRED_DEPS.COMMENT_AND_EVIDENCE,
};

/**
 * Has names of the back-end custom attribute control types.
 */
const caDefTypeName = {
  Text: 'Text',
  RichText: 'Rich Text',
  MapPerson: 'Map:Person',
  Date: 'Date',
  Input: 'Input',
  Checkbox: 'Checkbox',
  Dropdown: 'Dropdown',
};

/**
 * Represents relationships between back-end custom attribute control types
 * and controls which designed for it.
 */
const controlRelationshipType = {
  [caDefTypeName.Text]: CONTROL_TYPE.INPUT,
  [caDefTypeName.RichText]: CONTROL_TYPE.TEXT,
  [caDefTypeName.MapPerson]: CONTROL_TYPE.PERSON,
  [caDefTypeName.Date]: CONTROL_TYPE.DATE,
  [caDefTypeName.Input]: CONTROL_TYPE.INPUT,
  [caDefTypeName.Checkbox]: CONTROL_TYPE.CHECKBOX,
  [caDefTypeName.Dropdown]: CONTROL_TYPE.DROPDOWN,
};

/**
 * A set of properties which describe a minimum information
 * about represented object.
 * @typedef {Object} ObjectStub
 * @property {number} id - object id
 * @property {string} type - object type
 * @example
 * // stub for person
 * const personStub = {
 *  id: 123,
 *  type: "Person",
 * };
 */

/**
 * @class
 * @classdesc
 *  Represents the solid custom attriubte.
 *  Provides access to the value and the definition objects of
 *  the custom attribute. Also it has ability to validate itself.
 */
export default class CustomAttributeObject {
  /**
   * Creates CustomAttributeObject instance.
   * @param {can.Map} instance - An instance of some object.
   * @param {can.Map} caDefinition - A custom attribute definition owned by instance.
   * @param {can.Map=} caValue - A custom attribute value owned by instance.
   */
  constructor(
    instance,
    caDefinition,
    caValue = new can.Map()
  ) {
    /**
     * Instance of some object.
     * @private
     */
    this._instance = instance;

    /**
     * The custom attribute definition owned by instance.
     * @private
     */
    this._caDefinition = caDefinition;

    /**
     * The comment attachment state.
     * @private
     */
    this._hasAttachedComment = false;

    this._setupCaValue(caValue);
    this._buildStateValidator();
  }

  /**
   * Returns a custom attribute value.
   * @return {string|number|boolean} - The custom attribute value.
   */
  get value() {
    const caDef = this._caDefinition;
    const caValue = this._caValue;
    const attributeType = caDef.attr('attribute_type');

    switch (attributeType) {
      case caDefTypeName.MapPerson:
        return caValue.attr('attribute_object.id');
      case caDefTypeName.Checkbox:
        return caValue.attr('attribute_value') === '1'
          ? true
          : false;
      default:
        return caValue.attr('attribute_value');
    }
  }

  /**
   * Sets custom attribute value to newValue.
   * Depending on custom attribute definition can be set related to it fields of
   * custom attribute value object.
   * @param {(string|number|boolean)} newValue - The new value.
   */
  set value(newValue) {
    const caValue = this._caValue;
    const attributeObject = this._prepareAttributeObject(newValue);
    const attributeValue = this._prepareAttributeValue(newValue);
    caValue.attr('attribute_object', attributeObject);
    caValue.attr('attribute_value', attributeValue);
  }

  /**
   * Returns the attachment state for comment.
   * @return {boolean} - The attachment state.
   */
  get hasAttachedComment() {
    return this._hasAttachedComment;
  }

  /**
   * Sets the attachment state for comment.
   * @param {boolean} attached - The attachment state.
   */
  set hasAttachedComment(attached) {
    this._hasAttachedComment = attached;
  }

  /**
   * Returns the id for the custom attribute value.
   * @return {number} - The id for custom attribute value.
   */
  get customValueId() {
    return this._caValue.attr('id');
  }

  /**
   * Returns the title for the custom attribute.
   * @return {string} - The custom attribute title.
   */
  get title() {
    return this._caDefinition.attr('title');
  }

  /**
   * Returns the placeholder for the custom attribute.
   * @return {string} - the custom attribute placeholder.
   */
  get placeholder() {
    return this._caDefinition.attr('placeholder');
  }

  /**
   * Returns the help text for the custom attribute.
   * @return {string} - The custom attribute help text.
   */
  get helptext() {
    return this._caDefinition.attr('helptext');
  }

  /**
   * Returns the custom attribute id.
   * @return {number} - The custom attribute id.
   */
  get customAttributeId() {
    return this._caDefinition.attr('id');
  }

  /**
   * Checks if the custom attribute is mandatory.
   * @return {boolean} - true if the custom attribute is mandatory, else false.
   */
  get mandatory() {
    return this._caDefinition.attr('mandatory') === true;
  }

  /**
   * Returns the custom attribute control type.
   * @return {CONTROL_TYPE} - The control type.
   */
  get attributeType() {
    const caDef = this._caDefinition;
    return controlRelationshipType[caDef.attr('attribute_type')];
  }

  /**
   * Returns the stub for the person who modified the last time the value
   * of the custom attribute.
   * @return {ObjectStub} - The person stub.
   */
  get attributeObject() {
    return this._caValue.attr('attribute_object');
  }

  /**
   * Returns the custom attribute type.
   * @return {CUSTOM_ATTRIBUTE_TYPE} - The custom attribute type.
   */
  get type() {
    const caDef = this._caDefinition;
    const isGlobalCustomAttribute = _.isNull(caDef.attr('definition_id'));
    return isGlobalCustomAttribute
      ? CUSTOM_ATTRIBUTE_TYPE.GLOBAL
      : CUSTOM_ATTRIBUTE_TYPE.LOCAL;
  }

  /**
   * Returns the list of multiple choice options.
   * If the custom attribute doesn't have options then returns an empty list.
   * @return {string[]} - The list of multiple choice options.
   */
  get multiChoiceOptions() {
    const options = this._caDefinition.attr('multi_choice_options');
    return (typeof options === 'string')
      ? options.split(',')
      : [];
  }

  /**
   * Returns a list of requirements for the multi choice options.
   * If the custom attribute doesn't have requirements then returns an empty
   * list.
   * @return {CA_DD_REQUIRED_DEPS[]} - The list of requirements.
   */
  get multiChoiceMandatory() {
    const mandatoryOptions = this._caDefinition.attr('multi_choice_mandatory');
    const optionValues = (typeof mandatoryOptions === 'string')
      ? mandatoryOptions.split(',')
      : [];

    return optionValues.map((optionValue) =>
      caMultiChoiceMandatory[optionValue]
    );
  }

  /**
   * Returns HashMap object which contains the relationships between
   * the multi choice options and their requiremens.
   * @return {Object.<number, CA_DD_REQUIRED_DEPS>}
   *
   * @example
   *  multiChoiceOptions = ['option1', 'option2', 'option3']
   *  multiChoiceMandatory = [NONE, EVIDENCE, COMMENT]
   *  multiChoiceRequirements = {
   *    'option1': NONE,
   *    'option2': EVIDENCE,
   *    'option3': COMMENT,
   *  }
   */
  get multiChoiceRequirements() {
    const multiChoiceMandatory = this.multiChoiceMandatory;
    const optionValues = this.multiChoiceOptions;
    const initRequirements = {};

    return multiChoiceMandatory
      .reduce((requirements, requirement, requirementIndex) => {
        const optionValue = optionValues[requirementIndex];
        return {
          ...requirements,
          [optionValue]: requirement,
        };
      }, initRequirements);
  }

  /**
   * Returns the custom attribute validator.
   * @return {StateValidator} - The custom attribute validator.
   */
  get validator() {
    return this._validator;
  }

  /**
   * Returns the custom attribute validation state.
   * @return {can.Map} - The custom attribute validation state.
   */
  get validationState() {
    return this._validationState;
  }

  /**
   * Updates validationState.
   */
  validate() {
    const validator = this.validator;
    validator.validate();
    this.__validationState = validator.validationState;
  }

  /**
   * Updates validationState.
   * @private
   * @param {(Object|can.Map)} state - The object with fields for update.
   */
  set __validationState(state) {
    // use attr method
    this._validationState.attr(state);
  }

  /**
   * Setups caValue object.
   * For creation the custom attribute value object we must set necessary fields
   * for the back-end.
   * @example
   * Object = Objective
   * Fields:
   *
   * attribute_object -
   *   here there are 2 cases:
   *     1) if we have "Map:Person" custom attribute then set {@link ObjectStub}
   *        of the person.
   *     2) in other cases it must be null.
   * attribute_value - value for custom attribute
   *    for Map:Person - "Person" string
   * context - must be the same as have Object
   * custom_attribute_id - id from appopriate custom_attribute_definitions
   * Above is specified the necessary MINIMUM for the back-end.
   *
   * @private
   * @param {can.Map} caValue - The custom attriubte value object.
   */
  _setupCaValue(caValue) {
    const caDefinition = this._caDefinition;
    const instance = this._instance;
    const caAttributeValue = caValue.attr('attribute_value');

    // setup default values for mandatory fields
    const requiredDefaultFields = {
      attribute_object: this._prepareAttributeObject(caAttributeValue),
      attribute_value: this._prepareAttributeValue(caAttributeValue),
      context: instance.attr('context'),
      custom_attribute_id: caDefinition.attr('id'),
    };
    const caValueKeys = can.Map.keys(caValue);

    // set for caValue requiered fields if they were missed
    _.each(requiredDefaultFields, (requiredValue, key) => {
      const hasMissedRequieredField = !caValueKeys.includes(key);

      if (hasMissedRequieredField) {
        caValue.attr(key, requiredValue);
      }
    });

    this._caValue = caValue;
  }

  /**
   * Returns prepared value depending on attribute_type.
   * @private
   * @param {(string|number|boolean)} [value=''] - A value for the processing.
   * @return {(string|number)} - A prepared value.
   */
  _prepareAttributeValue(value = '') {
    const caDef = this._caDefinition;
    const attributeType = caDef.attr('attribute_type');

    switch (attributeType) {
      case caDefTypeName.MapPerson:
        return 'Person';
      case caDefTypeName.Checkbox:
        return (value === true || value === '1')
          ? '1'
          : '0';
      default:
        return value;
    }
  }

  /**
   * Returns the prepared attribute object depending on attribute_type.
   * @private
   * @param {string|number} value - The value for the processing.
   * @return {ObjectStub|null} - The prepared object.
   */
  _prepareAttributeObject(value) {
    const caDef = this._caDefinition;
    const attributeType = caDef.attr('attribute_type');
    const stubPerson = {
      id: value,
      type: 'Person',
    };

    switch (attributeType) {
      case caDefTypeName.MapPerson: return stubPerson;
      default: return null;
    }
  }

  /**
   * Builds the custom attribute validator.
   * @private
   */
  _buildStateValidator() {
    const initState = {};
    const injected = {
      currentCaObject: this, // injects self into validator
    };
    const validator = new StateValidator(initState, injected);

    /**
     * The custom attribute validator.
     * @private
     */
    this._validator = validator;

    /**
     * The custom attribute validation state.
     * @private
     */
    this._validationState = new can.Map();

    this.__validationState = validator.validationState;
  }
}
