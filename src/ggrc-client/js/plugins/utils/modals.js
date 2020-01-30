/*
 Copyright (C) 2020 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import ModalsController from '../../controllers/modals/modals-controller';
import {
  BUTTON_VIEW_CONFIRM_CANCEL,
  CONTENT_VIEW_CONFIRM,
} from './template-utils';
/**
 * Utils methods for showing standart modals
 */

function _onDismissHandler($target, dismiss) {
  $target.modal('hide').remove();
  if (dismiss) {
    dismiss();
  }
}

function confirm(options, success, dismiss) {
  let $target = $('<div class="modal hide ' +
    options.extraCssClass +
    '"></div>');

  import(/* webpackChunkName: "modalsCtrls" */'../../controllers/modals')
    .then(() => {
      $target
        .modal({backdrop: 'static'});

      new ModalsController($target, Object.assign({
        new_object_form: false,
        button_view: BUTTON_VIEW_CONFIRM_CANCEL,
        modal_confirm: 'Confirm',
        modal_description: 'description',
        modal_title: 'Confirm',
        content_view: CONTENT_VIEW_CONFIRM,
      }, options));

      $target.on('click', 'a.btn[data-toggle=confirm]', function (e) {
        let params = $(e.target).closest('.modal').find('form')
          .serializeArray();
        $target.modal('hide').remove();
        if (success) {
          success(params, $(e.target).data('option'));
        }
      })
        .on('click.modal-form.close', '[data-dismiss="modal"]', function () {
          _onDismissHandler($target, dismiss);
        })
        .on('keyup', function (e) {
          const ESCAPE_KEY_CODE = 27;
          const escapeKeyWasPressed = e.keyCode === ESCAPE_KEY_CODE;

          if (escapeKeyWasPressed) {
            _onDismissHandler($target, dismiss);
          }
        });
    });

  return $target;
}

// make buttons non-clickable when saving
const bindXHRToButton = (xhr, el, newtext) => {
  // binding of an ajax to a click is something we do manually
  let $el = $(el);
  let oldtext = $el[0] ? $el[0].innerHTML : '';

  if (newtext) {
    $el[0].innerHTML = newtext;
  }
  $el.addClass('disabled');
  $el.attr('disabled', true);
  xhr.finally(() => {
    // If .text(str) is used instead of innerHTML, the click event may not fire depending on timing
    if ($el.length) {
      $el.removeAttr('disabled')
        .removeClass('disabled')[0].innerHTML = oldtext;
    }
  });
};

// make element non-clickable when saving
const bindXHRToDisableElement = (xhr, el) => {
  // binding of an ajax to a click is something we do manually
  const $el = $(el);

  if (!$el.length) {
    return;
  }

  $el.addClass('disabled');

  xhr.finally(() => {
    $el.removeClass('disabled');
  });
};

export {
  confirm,
  bindXHRToButton,
  bindXHRToDisableElement,
};
