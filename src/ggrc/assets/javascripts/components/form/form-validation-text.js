/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';
  var tag = 'form-validation-text';
  var template = can.view(GGRC.mustache_path +
    '/components/form/form-validation-text.mustache');

  /**
   * Form validation text component
   */
  GGRC.Components('formValidationText', {
    tag: tag,
    template: template,
    viewModel: {
      define: {
        toggle: {},
        text: {
          type: String,
          value: 'This field is required.'
        }
      }
    }
  });
})(window.can, window.GGRC);
