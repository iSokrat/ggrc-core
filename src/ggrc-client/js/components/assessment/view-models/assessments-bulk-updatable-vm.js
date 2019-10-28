/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import canMap from 'can-map';
import ObjectOperationsBaseVM from '../../view-models/object-operations-base-vm';
import {notifier} from '../../../plugins/utils/notifiers-utils';
import {trackStatus} from '../../../plugins/utils/background-task-utils';
import {
  create,
  setDefaultStatusConfig,
} from '../../../plugins/utils/advanced-search-utils';
import {getAvailableAttributes} from '../../../plugins/utils/tree-view-utils';

export default ObjectOperationsBaseVM.extend({
  showSearch: false,
  isMyAssessmentsView: false,
  mappedToItems: [],
  filterItems: [],
  defaultFilterItems: [],
  mappingItems: [],
  filterAttributes: [],
  type: 'Assessment',
  element: null,
  getSelectedAssessmentsIds() {
    return this.attr('selected').serialize().map((selected) => selected.id);
  },
  initDefaultFilter() {
    const stateConfig = setDefaultStatusConfig(
      new canMap,
      this.attr('type'),
      this.attr('statesCollectionKey')
    );
    const items = [
      create.state(stateConfig),
      create.operator('AND'),
      create.attribute({
        field: 'Assignees',
        operator: '~',
        value: GGRC.current_user.email,
      }),
    ];

    this.attr('filterItems', items);
    this.attr('defaultFilterItems', items);
  },
  initFilterAttributes() {
    const attributes = getAvailableAttributes(this.attr('type'))
      .filter(({attr_name: attrName}) => attrName !== 'status');

    this.attr('filterAttributes', attributes);
  },
  trackBackgroundTask(taskId) {
    notifier('progress', 'Your bulk update is submitted. ' +
        'Once it is done you will get a notification. ' +
        'You can continue working with the app.');
    const url = `/api/background_tasks/${taskId}`;
    trackStatus(
      url,
      () => this.onSuccessHandler(),
      () => this.onFailureHandler());
  },
  onSuccessHandler() {
    const reloadLink = window.location.href;
    notifier('success', 'Bulk update is finished successfully. {reload_link}',
      {reloadLink});
  },
  onFailureHandler() {
    notifier('error', 'Bulk update is failed.');
  },
  closeModal() {
    this.attr('element').find('.modal-dismiss').trigger('click');
  },
});
