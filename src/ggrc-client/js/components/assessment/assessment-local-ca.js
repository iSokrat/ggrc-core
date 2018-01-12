/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {VALIDATION_ERROR, RELATED_ITEMS_LOADED} from '../../events/eventTypes';
import tracker from '../../tracker';
import Permission from '../../permission';

(function (GGRC, can) {
  'use strict';

  GGRC.Components('assessmentLocalCa', {
    tag: 'assessment-local-ca',
    viewModel: {
      instance: null,
      fields: [],
      evidences: [],
      isDirty: false,
      saving: false,
      highlightInvalidFields: false,
      define: {
        editMode: {
          type: 'boolean',
          value: false,
          set: function (newValue) {
            if (newValue === true) {
              this.attr('highlightInvalidFields', false);
            }
            return newValue;
          },
        },
        canEdit: {
          type: 'boolean',
          value: false,
          get: function () {
            return this.attr('editMode') &&
              Permission.is_allowed_for('update', this.attr('instance'));
          },
        },
      },
      hasValidationErrors() {
        return this.attr('fields')
          .filter(this.hasLocalValidationErrors).length > 0;
      },
      hasLocalValidationErrors(caObject) {
        const validationState = caObject.validationState;
        return (
          validationState.hasEmptyMandatoryValue ||
          validationState.hasMissingAttachments
        );
      },
      validateForm({
        triggerField = null,
        triggerAttachmentModals = false,
        saveDfd = null,
      } = {}) {
        this.attr('fields')
          .each((field) => {
            this.performValidation(field);

            if ( triggerField === field &&
                 triggerAttachmentModals &&
                 field.validationState.hasMissingAttachments ) {
              this.dispatch({
                type: 'missAttachments',
                field,
                saveDfd,
              });
            }
          });

        this.attr(
          'instance.hasValidationErrors',
          this.hasValidationErrors()
        );

        if (this.attr('instance.hasValidationErrors')) {
          this.dispatch(VALIDATION_ERROR);
        }
      },
      performValidation(caObject) {
        caObject.validate();
      },
      save(caId, value) {
        const stopFn = tracker.start(this.attr('instance.type'),
          tracker.USER_JOURNEY_KEYS.NAVIGATION,
          tracker.USER_ACTIONS.ASSESSMENT.EDIT_LCA);

        this.attr('isDirty', true);

        return this.attr('deferredSave').push(function () {
          this.applyChangesToCaObject(caId, value);
          self.attr('saving', true);
        })
        // todo: error handling
        .always(() => {
          this.attr('saving', false);
          this.attr('isDirty', false);
          stopFn();
        });
      },
      attributeChanged: function (e) {
        const caObject = e.field;
        const {
          value,
          fieldId: caId,
        } = e;

        if (caObject.value === value) {
          return;
        }

        // We set value for caObject two times -
        // before validation and when save instance
        this.applyChangesToCaObject(caId, value);
        this.performValidation(caObject);

        // Each time we unset a comment state to
        // give ability to set new comment when are
        // selected the option with required comment
        caObject.attachedComment = false;

        let saveDfd = this.save(caId, value);

        this.validateForm({
          triggerAttachmentModals: true,
          triggerField: caObject,
          saveDfd,
        });
      },
      applyChangesToCaObject(caId, value) {
        const instance = this.attr('instance');
        instance.customAttr(caId, value);
      },
    },
    events: {
      inserted: function () {
        this.viewModel.validateForm();
      },
      '{viewModel.evidences} change'() {
        this.viewModel.validateForm();
      },
      '{viewModel.instance} update': function () {
        this.viewModel.validateForm();
      },
      [`{viewModel.instance} ${RELATED_ITEMS_LOADED.type}`]: function () {
        this.viewModel.validateForm();
      },
      '{viewModel.instance} showInvalidField': function (ev) {
        let pageType = GGRC.page_instance().type;
        let $container = (pageType === 'Assessment') ?
          $('.object-area') : $('.cms_controllers_info_pin');
        let $body = (pageType === 'Assessment') ?
          $('.inner-content.widget-area') : $('.info-pane__body');
        let field;
        let index;

        index = _.findIndex(
          this.viewModel.attr('fields'),
          this.hasLocalValidationErrors
        );

        field = $('.field-wrapper')[index];

        if (!field) {
          return;
        }

        this.viewModel.attr('highlightInvalidFields', true);
        $container.animate({
          scrollTop: $(field).offset().top - $body.offset().top,
        }, 500);
      },
    },
    helpers: {
      isInvalidField(
        hasEmptyMandatoryValue,
        hasMissingAttachments,
        highlightInvalidFields,
        options
      ) {
        let isInvalid;

        hasEmptyMandatoryValue = Mustache.resolve(hasEmptyMandatoryValue);
        hasMissingAttachments = Mustache.resolve(hasMissingAttachments);
        highlightInvalidFields = Mustache.resolve(highlightInvalidFields);

        isInvalid = (
          hasEmptyMandatoryValue ||
          hasMissingAttachments
        );

        return isInvalid && highlightInvalidFields
          ? options.fn(options.context)
          : options.inverse(options.context);
      },
    },
  });
})(window.GGRC, window.can);
