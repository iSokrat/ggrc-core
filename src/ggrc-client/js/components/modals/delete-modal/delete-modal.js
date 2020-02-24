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
import {notifierXHR, notifier} from '../../../plugins/utils/notifiers-utils';
import modalTemplate from './templates/modal-template.stache';

const ViewModel = canDefineMap.extend({
  instance: {
    value: null,
  },
  modalElement: {
    value: null,
  },
  modalContext: {
    value() {
      return {
        instance: this.instance,
        isDisabled: false,
        deletableObjectName: this.instance.display_name(),
        onConfirmDeletion: this.confirmDeletion.bind(this),
        onCloseModal: this.closeModal.bind(this),
      };
    },
  },
  $element: {
    value: null,
  },
  set isObjectDeleting(value) {
    this.modalContext.isDisabled = value;

    const $backdrop = this.modalElement.data('modal').$backdrop;

    if (value) {
      $backdrop.addClass('disabled-block');
    } else {
      $backdrop.removeClass('disabled-block');
    }
  },
  onConfirm() {
    // modal should be reset each time in order to
    // canjs's bindings are working correctly
    this.setupModal();

    this.modalElement.modal('show');
  },
  setupModal() {
    const modalFragment = canStache(modalTemplate)(this.modalContext);
    const modalElement = $('<div class="modal hide"></div>');

    modalElement
      .html(modalFragment)
      .on('keyup', (event) => this.onKeyup(event))
      .draggable({handle: '.modal-header'});

    this.modalElement = modalElement;
  },
  onKeyup(event) {
    const ESCAPE_CODE = 27;

    if (event.which === ESCAPE_CODE && this.modalContext.isDisabled) {
      // prevent closing of the modal by bootstrap's handler
      event.stopImmediatePropagation();
    }
  },
  closeModal() {
    // close delete modal & remove it from DOM (+ all event listeners)
    this.modalElement.modal('hide').remove();
  },
  async confirmDeletion() {
    this.isObjectDeleting = true;

    try {
      const instance = this.instance;

      await instance.refresh();
      await instance.destroy();

      notifier('success', `${instance.display_name()} deleted successfully`);

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
        // close the parent edit modal
        const parentEditModal = this.$element.closest('.modal');
        // prevent refreshing of the instance in modals-controller
        // (' hide' handler)
        parentEditModal.control().options.skip_refresh = true;
        parentEditModal.modal_form('hide');

        this.closeModal();
      }

      pubSub.dispatch({
        type: 'objectDeleted',
        instance,
      });
    } catch (xhr) {
      notifierXHR('error', xhr);
    } finally {
      this.isObjectDeleting = false;
    }
  },
});

export default canComponent.extend({
  tag: 'delete-modal',
  leakScope: true,
  ViewModel,
  events: {
    inserted(element) {
      this.viewModel.$element = $(element);
    },
  },
});
