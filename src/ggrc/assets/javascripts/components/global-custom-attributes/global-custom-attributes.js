/*
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {
  getCustomAttributeType,
  convertFromCaValue,
} from '../../plugins/utils/ca-utils';
import Permission from '../../permission';

(function (can, GGRC) {
  'use strict';

  /**
   * Global Custom Attributes is a component representing custom attributes.
   */
  GGRC.Components('globalCustomAttributes', {
    tag: 'global-custom-attributes',
    template: '<content/>',
    viewModel: {
      define: {
        /**
         * Indicates whether custome attributes can be edited.
         * @type {boolean}
         */
        isEditDenied: {
          type: 'boolean',
          get: function () {
            return this.attr('instance.snapshot') ||
              this.attr('instance.isRevision') ||
              this.attr('instance.archived') ||
              !Permission.is_allowed_for('update', this.attr('instance'));
          },
        },
      },
      instance: null,
      /**
       * Contains custom attributes.
       * @type {can.List}
       */
      items: [],
      initCustomAttributes: function () {
        var result = [];

        can.each(this.attr('instance.custom_attribute_definitions'),
          function (cad) {
            var type = getCustomAttributeType(cad.attribute_type);
            var value;
            var options = cad.multi_choice_options &&
              typeof cad.multi_choice_options === 'string' ?
                cad.multi_choice_options.split(',') : [];

            can.each(this.attr('instance.custom_attribute_values'),
              function (val) {
                val = val.isStub ? val : val.reify();
                if (val.custom_attribute_id === cad.id) {
                  value = convertFromCaValue(
                    type,
                    val.attribute_value,
                    val.attribute_object
                  );
                }
              });

            result.push({
              id: cad.id,
              title: cad.title,
              label: cad.label,
              placeholder: cad.placeholder,
              helptext: cad.helptext,
              value: value,
              options: options,
              type: type,
            });
          }.bind(this));

        this.attr('items', result);
      },
      saveCustomAttributes: function (event, field) {
        var id = field.id;
        var type = field.type;
        var value = event.value;
        var instance = this.attr('instance');

        this.attr('isSaving', true);

        instance.attr('custom_attributes.' + id, this.getValue(type, value));

        instance.save()
          .done(function () {
            $(document.body).trigger('ajax:flash', {
              success: 'Saved',
            });
          })
          .fail(function () {
            $(document.body).trigger('ajax:flash', {
              error: 'There was a problem saving',
            });
          })
          .always(function () {
            this.attr('isSaving', false);
          }.bind(this));
      },
      getValue: function (type, value) {
        if (type === 'checkbox') {
          return value ? 1 : 0;
        }
        if (type === 'person') {
          return value ? ('Person:' + value) : 'Person:None';
        }
        if (type === 'dropdown') {
          if (value && value === '') {
            return undefined;
          }
        }
        return value;
      },
    },
    init: function () {
      this.viewModel.initCustomAttributes();
    },
    events: {
      '{viewModel.instance} readyForRender': function () {
          this.viewModel.initCustomAttributes();
      },
    },
  });
})(window.can, window.GGRC);
