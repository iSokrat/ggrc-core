/*
 Copyright (C) 2020 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import canDefineMap from 'can-define/map/map';
import canComponent from 'can-component';
import {warning} from '../../../plugins/utils/modals';
import {hasWarningType} from '../../../plugins/utils/controllers';
import {changeUrl} from '../../../router';
import modalModels from '../../../models/modal-models';
import {
  getPageInstance,
  navigate,
} from '../../../plugins/utils/current-page-utils';

const ViewModel = canDefineMap.extend({
  async onConfirm(el) {
    const {'default': DeleteModalControl} = await import(
      /* webpackChunkName: "modalsDeleteCtrls" */
      '../../../controllers/modals/delete-modal-controller'
    );
    const $trigger = $(el);
    const $target = $('<div class="modal hide"></div>');
    const option = $trigger.data();

    let model = modalModels[$trigger.attr('data-object-singular')];
    let instance;
    let modalSettings;

    if ($trigger.attr('data-object-id') === 'page') {
      instance = getPageInstance();
    } else {
      instance = model.findInCacheById($trigger.attr('data-object-id'));
    }

    modalSettings = {
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
    };

    if (hasWarningType(instance)) {
      modalSettings = Object.assign(
        modalSettings,
        warning.settings,
        {
          objectShortInfo: [instance.type, instance.title].join(' '),
          confirmOperationName: 'delete',
          operation: 'deletion',
        }
      );
    }

    $target.modal_form(option, $trigger);

    warning(
      modalSettings,
      () => ({}),
      () => ({}), {
        controller: DeleteModalControl,
        target: $target,
      });

    $target.on('modal:success', function (e, data) {
      let modelName = $trigger.attr('data-object-plural').toLowerCase();
      if ($trigger.attr('data-object-id') === 'page' ||
        (instance === getPageInstance())) {
        navigate('/dashboard');
      } else if (modelName === 'people' || modelName === 'roles') {
        changeUrl('/admin#' + modelName + '_list');
        navigate();
      } else {
        $trigger.trigger('modal:success', data);
        $target.modal_form('hide');
      }
    });
  },
});

export default canComponent.extend({
  tag: 'delete-modal',
  leakScope: true,
  ViewModel,
});
