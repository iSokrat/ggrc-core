/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */
(function (can, GGRC) {
  'use strict';

  GGRC.Components('autoSaveFormField', {
    tag: 'auto-save-form-field',
    template: can.view(
      GGRC.mustache_path +
      '/components/auto-save-form/auto-save-form-field.mustache'
    ),
    viewModel: {
      define: {
        disabled: {
          type: 'htmlbool'
        },
        isValid: {
          get: function () {
            var isValid = false;

            if (this.attr('validation.show')) {
              isValid = this.attr('validation.valid');
            }

            return isValid;
          }
        }
      },
      type: null,
      value: null,
      fieldId: null,
      placeholder: '',
      options: [],
      validation: {},
      fieldValueChanged: function (e, scope) {
        this.dispatch({
          type: 'valueChanged',
          fieldId: e.fieldId,
          value: e.value,
          field: scope
        });
      }
    }
  });
})(window.can, window.GGRC);
