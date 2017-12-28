/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';
  var tag = 'form-validation-icon';
  /**
   * State object to present possible icons for validation
   */
  var icons = {
    noValidation: 'fa-check-circle',
    empty: '',
    valid: 'fa-check form-validation-icon__color-valid',
    invalid: 'fa-times form-validation-icon__color-invalid'
  };

  /**
   * Form validation icon component
   */
  GGRC.Components('formValidationIcon', {
    tag: tag,
    template: '<i class="fa form-validation-icon__body {{iconCls}}"></i>',
    viewModel: {
      define: {
        iconCls: {
          get() {
            const validation = this.attr('validation');
            const hasEmptyMandatoryValue =
              validation.attr('hasEmptyMandatoryValue');
            const hasMissingAttachments =
              validation.attr('hasMissingAttachments');
            const hasRequiredAttachments =
              validation.attr('hasRequiredAttachments');
            const isMandatory = this.attr('mandatory');
            let icon = icons.valid;
            const hasInvalidIcon = (
              hasEmptyMandatoryValue ||
              hasMissingAttachments
            );
            const isEmptyIcon = (
              !isMandatory &&
              !hasRequiredAttachments
            );

            if (hasInvalidIcon) {
              icon = icons.invalid;
            } else if (isEmptyIcon) {
              icon = icons.empty;
            }

            return icon;
          }
        }
      },
      validation: {},
      mandatory: false,
    },
  });
})(window.can, window.GGRC);
