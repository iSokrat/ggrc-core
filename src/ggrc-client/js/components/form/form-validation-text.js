/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

'use strict';
let tag = 'form-validation-text';

let textMap = {
  input: 'This field is required.',
  checkbox: 'This checkbox is required.',
  dropdownNoInfo: 'Add required info by click on the link.',
};

/**
 * Form validation text component
 */
GGRC.Components('formValidationText', {
  tag: tag,
  template: '<p class="required">{{text}}</p>',
  viewModel: {
    define: {
      text: {
        type: String,
        value: 'This field is required.',
        get: function () {
          let text;

          switch (this.attr('type')) {
            case 'dropdown':
              text = this.attr('validation.hasMissingAttachments') ?
                textMap.dropdownNoInfo : textMap.input;
              break;

            case 'checkbox':
              text = textMap.checkbox;
              break;

            default:
              text = textMap.input;
              break;
          }
          return text;
        },
      },
    },
    validation: {},
    type: 'input',
  },
});
