/* !
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

'use strict';

import './cycle-task-workflow-preloader';
import './cycle-task-workflow-link';

import template from './templates/cycle-task-group-object-task.mustache';

const viewModel = can.Map.extend({
  define: {
    hasTaskName: {
      get: function () {
        const taskType = this.attr('instance.task_type');
        const hasTaskName = !_.isEmpty(taskType) && taskType !== 'text';

        return hasTaskName;
      },
    },
  },
  instance: {},
  onChangeState: function (ev) {
    const instance = this.attr('instance');
    const newStatus = event.state;

    instance.refresh()
      .then((refreshed) => {
        refreshed.attr('status', newStatus);
        return refreshed.save();
      });
  },
});

export default GGRC.Components('cycleTaskGroupObjectTask', {
  tag: 'cycle-task-group-object-task',
  template,
  viewModel,
});
