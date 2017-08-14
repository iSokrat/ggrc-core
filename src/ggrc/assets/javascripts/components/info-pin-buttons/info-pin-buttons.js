/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can) {
  'use strict';

  GGRC.Components('infoPinButtons', {
    tag: 'info-pin-buttons',
    template: can.view(
      GGRC.mustache_path +
      '/components/info-pin-buttons/info-pin-buttons.mustache'
    ),
    viewModel: {
      onChangeMaximizedState: null,
      onClose: null,
      define: {
        maximized: {
          type: 'boolean',
          'default': false
        }
      },
      toggleSize: function (el, ev) {
        var maximized = !this.attr('maximized');
        var onChangeMaximizedState =
           Mustache.resolve(this.onChangeMaximizedState);
        ev.preventDefault();

        onChangeMaximizedState(maximized);

        // Add in a callback queue
        // for executing other
        // handlers in the first place.
        // Without it CanJS will ignore them
        setTimeout(function () {
          this.attr('maximized', maximized);
        }.bind(this), 0);
      },
      close: function (el, ev) {
        var onClose = Mustache.resolve(this.onClose);
        this._removeTooltip(el);
        ev.preventDefault();
        onClose();
      },
      _removeTooltip: function (el) {
        $(el)
          .find('[rel="tooltip"]')
          .data('tooltip')
          .hide();
      }
    }
  }, true);
})(window.can);
