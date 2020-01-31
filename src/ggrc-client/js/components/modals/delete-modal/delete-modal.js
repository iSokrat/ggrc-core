/*
 Copyright (C) 2020 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import canDefineMap from 'can-define/map/map';
import canComponent from 'can-component';
import {changeUrl} from '../../../router';
import modalModels from '../../../models/modal-models';
import {
  getPageInstance,
  navigate,
} from '../../../plugins/utils/current-page-utils';
import pubSub from '../../../pub-sub';
import {bindXHRToButton} from '../../../plugins/utils/modals';
import {notifierXHR, notifier} from '../../../plugins/utils/notifiers-utils';

const ViewModel = canDefineMap.extend({
  async onConfirm(el) {
    const $trigger = $(el);
    const $target = $('<div class="modal hide"></div>');
    const option = $trigger.data();

    let model = modalModels[$trigger.attr('data-object-singular')];
    let instance = model.findInCacheById($trigger.attr('data-object-id'));


    $target.modal_form(option, $trigger);

    const {'default': ModalsController} = await import(
      /* webpackChunkName: "modalsCtrls" */
      '../../../controllers/modals/modals-controller'
    );

    new ModalsController($target, {
      $trigger: $trigger,
      skip_refresh: true,
      new_object_form: false,
      button_view:
        '/modals/delete-cancel-buttons.stache',
      model: model,
      instance: instance,
      modal_title: 'Delete ' + $trigger.attr('data-object-singular'),
      content_view:
        '/base_objects/confirm-delete.stache',
    });

    $target
      .on('click', 'a.btn[data-toggle=delete]:not(:disabled)', (event) => {
        // Disable the cancel button.
        let cancelButton = $target.find('a[data-dismiss=modal]');
        let modalBackdrop = $target.data('modal_form').$backdrop;

        const promise = new Promise((resolve, reject) => {
          instance.refresh()
            .then(resolve)
            .catch(reject);
        });

        bindXHRToButton(
          promise
            .then((instance) => instance.destroy())
            .then((instance) => {
              // If this modal is spawned from an edit modal, make sure that one does
              // not refresh the instance post-delete.
              let parentController = $($trigger)
                .closest('.modal').control();

              if (parentController) {
                // handled in modals-controller.js
                parentController.options.skip_refresh = true;
              }

              const message =
                `${instance.display_name()} deleted successfully`;
              notifier('success', message);

              let modelName = $trigger.attr('data-object-plural').toLowerCase();
              if (instance === getPageInstance()) {
                navigate('/dashboard');
              } else if (modelName === 'people' || modelName === 'roles') {
                changeUrl('/admin#' + modelName + '_list');
                navigate();
              } else {
                $trigger.trigger('modal:success', instance);
                $target.modal_form('hide');
              }

              pubSub.dispatch({
                type: 'objectDeleted',
                instance,
              });

              return new Promise(() => {}); // on success, just let the modal be destroyed or navigation happen.
              // Do not re-enable the form elements.
            }).catch((xhr) => {
              notifierXHR('error', xhr);
            }),
          $(event.target).add(cancelButton).add(modalBackdrop)
        );
      });
  },
});

export default canComponent.extend({
  tag: 'delete-modal',
  leakScope: true,
  ViewModel,
});
