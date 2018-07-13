/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  ddValidationMapToValue,
} from '../../../plugins/utils/ca-utils';
import Permission from '../../../permission';
import {getComponentVM} from '../../../../js_specs/spec_helpers';
import Component from '../assessment-local-ca';

describe('assessment-local-ca component', () => {
  let viewModel;

  beforeEach(() => {
    viewModel = getComponentVM(Component);
  });

  describe('canEdit getter', () => {
    let spy;

    beforeEach(() => {
      spy = spyOn(Permission, 'is_allowed_for');
      viewModel.attr('instance', {});
    });

    it('returns false if it is not editMode', () => {
      viewModel.attr('editMode', false);
      expect(viewModel.attr('canEdit')).toBe(false);
    });

    describe('if it is in editMode', () => {
      beforeEach(() => {
        viewModel.attr('editMode', true);
      });

      it('returns false if it is not allowed for update', () => {
        spy.and.returnValue(false);
        expect(viewModel.attr('canEdit')).toBe(false);
        expect(spy).toHaveBeenCalledWith('update', viewModel.attr('instance'));
      });

      it('returns true if it is allowed for update', () => {
        spy.and.returnValue(true);
        expect(viewModel.attr('canEdit')).toBe(true);
        expect(spy).toHaveBeenCalledWith('update', viewModel.attr('instance'));
      });
    });
  });

  describe('check performValidation', function () {
    let inputField;
    let checkboxField;
    let performValidation;

    beforeEach(function () {
      viewModel.attr('evidenceAmount', 0);
      performValidation = viewModel.performValidation.bind(viewModel);

      inputField = new can.Map({
        type: 'input',
        validationConfig: null,
        preconditions_failed: null,
        validation: {
          mandatory: false,
        },
      });

      checkboxField = new can.Map({
        type: 'checkbox',
        validationConfig: null,
        preconditions_failed: null,
        validation: {
          mandatory: false,
        },
      });
    });

    it('should ensure evidenceAmount prop works', function () {
      viewModel.attr('evidenceAmount', 0);
      expect(viewModel.attr('evidenceAmount')).toBe(0);
    });

    it('should ensure evidenceAmount prop works', function () {
      viewModel.attr('evidenceAmount', 1);
      expect(viewModel.attr('evidenceAmount')).toBe(1);
    });

    it('should validate non-mandatory checkbox', function () {
      viewModel.attr('fields', [checkboxField]);
      performValidation(checkboxField);

      expect(checkboxField.attr().validation).toEqual({
        show: false,
        valid: true,
        hasMissingInfo: false,
        mandatory: false,
      });

      performValidation(checkboxField);

      expect(checkboxField.attr().validation).toEqual({
        show: false,
        valid: true,
        hasMissingInfo: false,
        mandatory: false,
      });
    });

    it('should validate mandatory checkbox', function () {
      viewModel.attr('fields', [checkboxField]);
      checkboxField.attr('value', null);
      checkboxField.attr('validation.mandatory', true);

      performValidation(checkboxField);
      expect(checkboxField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: false,
        hasMissingInfo: false,
      });

      checkboxField.attr('value', 0);
      performValidation(checkboxField);
      expect(checkboxField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: false,
        hasMissingInfo: false,
      });

      checkboxField.attr('value', 1);
      performValidation(checkboxField);
      expect(checkboxField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: true,
        hasMissingInfo: false,
      });

      checkboxField.attr('value', '1');
      performValidation(checkboxField);
      expect(checkboxField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: true,
        hasMissingInfo: false,
      });
    });

    it('should validate non-mandatory input', function () {
      viewModel.attr('fields', [inputField]);
      inputField.attr('value', '');

      performValidation(inputField);
      expect(inputField.attr().validation).toEqual({
        mandatory: false,
        show: false,
        valid: true,
        hasMissingInfo: false,
      });

      inputField.attr('value', 'some input');
      performValidation(inputField);
      expect(inputField.attr().validation).toEqual({
        mandatory: false,
        show: false,
        valid: true,
        hasMissingInfo: false,
      });
    });

    it('should validate mandatory input', function () {
      viewModel.attr('fields', [inputField]);
      inputField.attr('value', '');

      inputField.attr('validation.mandatory', true);

      performValidation(inputField);
      expect(inputField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: false,
        hasMissingInfo: false,
      });

      inputField.attr('value', 'some input');
      performValidation(inputField);
      expect(inputField.attr().validation).toEqual({
        mandatory: true,
        show: true,
        valid: true,
        hasMissingInfo: false,
      });
    });
  });

  describe('check performDropdownValidation', () => {
    let dropdownField;
    let performDropdownValidation;

    beforeEach(function () {
      viewModel.attr('evidenceAmount', 0);
      viewModel.attr('urlsAmount', 0);
      performDropdownValidation = viewModel.performDropdownValidation
        .bind(viewModel);

      dropdownField = new can.Map({
        type: 'dropdown',
        validationConfig: {
          'nothing required': ddValidationMapToValue(),
          'comment required': ddValidationMapToValue({
            comment: true,
          }),
          'evidence required': ddValidationMapToValue({
            attachment: true,
          }),
          'com+ev required': ddValidationMapToValue({
            comment: true,
            attachment: true,
          }),
          'ev+url required': ddValidationMapToValue({
            url: true,
            attachment: true,
          }),
          'com+url required': ddValidationMapToValue({
            comment: true,
            url: true,
          }),
          'ev+com+url required': ddValidationMapToValue({
            attachment: true,
            comment: true,
            url: true,
          }),
        },
        preconditions_failed: [],
        validation: {
          mandatory: false,
        },
        errorsMap: {
          comment: false,
          evidence: false,
          url: false,
        },
      });
    });

    it('should validate dropdown with not selected value', function () {
      // Nothing selected. i.e. None
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', '');

      performDropdownValidation(dropdownField);
      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: false,
        valid: true,
        hasMissingInfo: false,
        requiresAttachment: false,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with a plain value', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'nothing required');

      performDropdownValidation(dropdownField);
      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: true,
        hasMissingInfo: false,
        requiresAttachment: false,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with a comment required value and comment ' +
       'missing', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'comment required');

      dropdownField.attr('errorsMap.comment', true);
      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: false,
        hasMissingInfo: true,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: true,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with a comment required value and comment ' +
       'present', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'comment required');

      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: true,
        hasMissingInfo: false,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with an evidence required value and ' +
       'evidence missing', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'evidence required');

      dropdownField.attr('errorsMap.evidence', true);
      performDropdownValidation(dropdownField);

      expect(viewModel.attr('evidenceAmount')).toBe(0);
      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: false,
        hasMissingInfo: true,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: true,
        url: false,
      });
    });

    it('should validate dropdown with an evidence required value and ' +
       'evidence present', function () {
      viewModel.attr('fields', [dropdownField]);
      viewModel.attr('evidenceAmount', 1);
      dropdownField.attr('value', 'evidence required');

      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: true,
        hasMissingInfo: false,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with both evidence and ' +
       'comment required values with both of them missing', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'com+ev required');

      dropdownField.attr('errorsMap.comment', true);
      dropdownField.attr('errorsMap.evidence', true);

      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: false,
        hasMissingInfo: true,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: true,
        evidence: true,
        url: false,
      });
    });

    it('should validate dropdown with both evidence and ' +
       'comment required values with evidence missing', function () {
      viewModel.attr('fields', [dropdownField]);
      dropdownField.attr('value', 'com+ev required');

      dropdownField.attr('errorsMap.evidence', true);
      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: false,
        hasMissingInfo: true,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: true,
        url: false,
      });
    });

    it('should validate dropdown with both evidence and ' +
       'comment required values with comment missing', function () {
      viewModel.attr('fields', [dropdownField]);
      viewModel.attr('evidenceAmount', 1);

      dropdownField.attr('value', 'com+ev required');
      dropdownField.attr('errorsMap.comment', true);

      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: false,
        hasMissingInfo: true,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: true,
        evidence: false,
        url: false,
      });
    });

    it('should validate dropdown with both evidence and ' +
       'comment required values with both of them present', function () {
      viewModel.attr('fields', [dropdownField]);
      viewModel.attr('evidenceAmount', 1);

      dropdownField.attr('value', 'com+ev required');
      performDropdownValidation(dropdownField);

      expect(dropdownField.attr().validation).toEqual({
        mandatory: false,
        show: true,
        valid: true,
        hasMissingInfo: false,
        requiresAttachment: true,
      });
      expect(dropdownField.attr().errorsMap).toEqual({
        comment: false,
        evidence: false,
        url: false,
      });
    });

    describe('should validate dropdown with evidence and ' +
    'url required values', () => {
      beforeEach(() => {
        viewModel.attr('fields', [dropdownField]);
        dropdownField.attr('value', 'ev+url required');
      });

      it('if both of them present', () => {
        viewModel.attr('evidenceAmount', 1);
        viewModel.attr('urlsAmount', 1);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: true,
          hasMissingInfo: false,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: false,
        });
      });

      it('if evidence is missing', () => {
        viewModel.attr('urlsAmount', 1);
        dropdownField.attr('errorsMap.evidence', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: true,
          url: false,
        });
      });

      it('if url is missing', () => {
        viewModel.attr('evidenceAmount', 1);
        dropdownField.attr('errorsMap.url', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: true,
        });
      });

      it('if both of them missing', () => {
        dropdownField.attr('errorsMap.url', true);
        dropdownField.attr('errorsMap.evidence', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: true,
          url: true,
        });
      });
    });

    describe('should validate dropdown with comment and ' +
    'url required values', () => {
      beforeEach(() => {
        viewModel.attr('fields', [dropdownField]);
        dropdownField.attr('value', 'com+url required');
      });

      it('if both of them present', () => {
        viewModel.attr('urlsAmount', 1);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: true,
          hasMissingInfo: false,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: false,
        });
      });

      it('if comment is missing', () => {
        viewModel.attr('urlsAmount', 1);
        dropdownField.attr('errorsMap.comment', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: true,
          evidence: false,
          url: false,
        });
      });

      it('if url is missing', () => {
        dropdownField.attr('errorsMap.url', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: true,
        });
      });

      it('if both of them missing', () => {
        dropdownField.attr('errorsMap.url', true);
        dropdownField.attr('errorsMap.comment', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: true,
          evidence: false,
          url: true,
        });
      });
    });

    describe('should validate dropdown with evidence, comment and ' +
    'url required values', () => {
      beforeEach(() => {
        viewModel.attr('fields', [dropdownField]);
        dropdownField.attr('value', 'ev+com+url required');
      });

      it('if all of them present', () => {
        viewModel.attr('evidenceAmount', 1);
        viewModel.attr('urlsAmount', 1);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: true,
          hasMissingInfo: false,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: false,
        });
      });

      it('if evidence is missing', () => {
        viewModel.attr('urlsAmount', 1);
        dropdownField.attr('errorsMap.evidence', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: true,
          url: false,
        });
      });

      it('if url is missing', () => {
        viewModel.attr('evidenceAmount', 1);
        dropdownField.attr('errorsMap.url', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: false,
          url: true,
        });
      });

      it('if evidence and url is missing', () => {
        dropdownField.attr('errorsMap.evidence', true);
        dropdownField.attr('errorsMap.url', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: false,
          evidence: true,
          url: true,
        });
      });

      it('if comment and url is missing', () => {
        viewModel.attr('evidenceAmount', 1);
        dropdownField.attr('errorsMap.comment', true);
        dropdownField.attr('errorsMap.url', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: true,
          evidence: false,
          url: true,
        });
      });

      it('if comment and evidence is missing', () => {
        viewModel.attr('urlsAmount', 1);
        dropdownField.attr('errorsMap.comment', true);
        dropdownField.attr('errorsMap.evidence', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: true,
          evidence: true,
          url: false,
        });
      });

      it('if all of them missing', () => {
        dropdownField.attr('errorsMap.url', true);
        dropdownField.attr('errorsMap.evidence', true);
        dropdownField.attr('errorsMap.comment', true);

        performDropdownValidation(dropdownField);

        expect(dropdownField.attr().validation).toEqual({
          mandatory: false,
          show: true,
          valid: false,
          hasMissingInfo: true,
          requiresAttachment: true,
        });
        expect(dropdownField.attr().errorsMap).toEqual({
          comment: true,
          evidence: true,
          url: true,
        });
      });
    });
  });

  describe('check attributeChanged', function () {
    let inputField;
    let dropdownField;
    let attributeChanged;
    let validateFormSpy;
    let saveSpy;
    let saveDfd;

    beforeEach(function () {
      attributeChanged = viewModel.attributeChanged.bind(viewModel);
      validateFormSpy = spyOn(viewModel, 'validateForm');
      saveDfd = can.Deferred();
      saveSpy = spyOn(viewModel, 'save').and.returnValue(saveDfd);

      inputField = new can.Map({
        id: 1,
        type: 'input',
        validationConfig: null,
        preconditions_failed: null,
        validation: {
          mandatory: false,
        },
      });

      dropdownField = new can.Map({
        id: 2,
        type: 'dropdown',
        validationConfig: {
          'nothing required': ddValidationMapToValue(),
          'comment required': ddValidationMapToValue({
            comment: true,
          }),
          'evidence required': ddValidationMapToValue({
            attachment: true,
          }),
          'com+ev required': ddValidationMapToValue({
            comment: true,
            attachment: true,
          }),
        },
        preconditions_failed: [],
        validation: {
          mandatory: false,
        },
        errorsMap: {
          comment: false,
          evidence: false,
          url: false,
        },
      });
    });

    it('should validate form and save instance on field change event',
      function () {
        let fieldChangeEvent = new can.Map({
          fieldId: inputField.id,
          field: inputField,
          value: 'new value',
        });

        attributeChanged(fieldChangeEvent);

        expect(saveSpy).toHaveBeenCalledWith(inputField.id, inputField.value);
        expect(validateFormSpy).toHaveBeenCalledWith({
          triggerField: inputField,
          triggerAttachmentModals: true,
          saveDfd,
        });
        expect(inputField.attr('value')).toEqual(fieldChangeEvent.value);
      });

    it('should force requirement of a new comment on dropdown field change',
      function () {
        let fieldChangeEvent = new can.Map({
          fieldId: dropdownField.id,
          field: dropdownField,
          value: 'comment required',
        });

        attributeChanged(fieldChangeEvent);

        expect(saveSpy).toHaveBeenCalledWith(
          dropdownField.id,
          dropdownField.value);
        expect(validateFormSpy).toHaveBeenCalledWith({
          triggerField: dropdownField,
          triggerAttachmentModals: true,
          saveDfd,
        });
        expect(dropdownField.attr('value')).toEqual(fieldChangeEvent.value);
        expect(dropdownField.attr('errorsMap.comment')).toEqual(true);
      });
  });
});
