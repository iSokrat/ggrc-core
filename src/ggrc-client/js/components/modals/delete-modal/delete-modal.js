/*
 Copyright (C) 2020 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import canDefineMap from 'can-define/map/map';
import canComponent from 'can-component';
import canStache from 'can-stache';
import {changeUrl} from '../../../router';
import {
  getPageInstance,
  navigate,
} from '../../../plugins/utils/current-page-utils';
import pubSub from '../../../pub-sub';
import {bindXHRToButton} from '../../../plugins/utils/modals';
import {notifierXHR, notifier} from '../../../plugins/utils/notifiers-utils';
import modalTemplate from './templates/modal-template.stache';

const ViewModel = canDefineMap.extend({
  instance: {
    value: null,
  },
  async onConfirm(el) {
    const instance = this.instance;
    const displayName = instance.display_name();
    const modalFragment = canStache(modalTemplate)({
      modalTitle: `Delete ${instance.constructor.model_singular}`,
      objectType: instance.attr('type'),
      displayName,
    });

    const $target = $('<div class="modal hide"></div>')
      .html(modalFragment);

    $target
      .modal()
      .draggable({handle: '.modal-header'});

    $target
      .on('click', 'a.btn[data-toggle=delete]:not(:disabled)', (event) => {
        // Disable the cancel button.
        let cancelButton = $target.find('a[data-dismiss=modal]');
        let modalBackdrop = $target.data('modal').$backdrop;

        const promise = new Promise((resolve, reject) => {
          instance.refresh()
            .then(resolve)
            .catch(reject);
        });

        bindXHRToButton(
          promise
            .then((instance) => instance.destroy())
            .then((instance) => {
              const $trigger = $(el);

              // If this modal is spawned from an edit modal, make sure that one does
              // not refresh the instance post-delete.
              let parentController = $trigger
                .closest('.modal').control();

              if (parentController) {
                // handled in modals-controller.js
                parentController.options.skip_refresh = true;
              }

              const message =
                `${instance.display_name()} deleted successfully`;
              notifier('success', message);

              const modelNamePlural = instance.constructor.table_plural;
              if (instance === getPageInstance()) {
                navigate('/dashboard');
              } else if (
                modelNamePlural === 'people' ||
                modelNamePlural === 'roles'
              ) {
                changeUrl(`/admin#${modelNamePlural}_list`);
                navigate();
              } else {
                $trigger.trigger('modal:success', instance);
                $target.modal('hide');
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
