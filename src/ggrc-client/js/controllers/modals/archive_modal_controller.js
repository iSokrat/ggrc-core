/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import ModalsController from './modals_controller';

export default ModalsController({
  pluginName: 'ggrc_controllers_toggle_archive',
  defaults: {
    skip_refresh: false,
  },
}, {
  init: function () {
    this._super();
  },
  'a.btn[data-toggle=archive]:not(:disabled) click': function (el, ev) {
    // Disable the cancel button.
    let cancelButton = this.element.find('a.btn[data-dismiss=modal]');
    let modalBackdrop = this.element.data('modal_form').$backdrop;

    this.bindXHRToButton(this.options.instance.refresh()
      .then(function () {
        let instance = this.options.instance;
        instance.attr('archived', true);
        return this.options.instance.save();
      }.bind(this))
      .then(function () {
        const instance = this.options.instance;
        const msg = `${instance.display_name()} archived successfully`;
        $(document.body).trigger('ajax:flash', {success: msg});
        if (this.element) {
          this.element.trigger('modal:success', instance);
        }

        return new $.Deferred();
      }.bind(this))
      .fail(function (xhr, status) {
        $(document.body).trigger('ajax:flash', {error: xhr.responseText});
      }), el.add(cancelButton).add(modalBackdrop));
  },
});
