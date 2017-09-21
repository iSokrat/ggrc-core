/* !
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

'use strict';

const viewModel = can.Map.extend({
  cycle: {},
  workflow: {},
  init: function () {
    this.loadWorkflow();
  },
  loadCycle: function () {
    const cycle = this.attr('cycle').reify();
    const refreshQueue = new RefreshQueue().enqueue(cycle);

    return refreshQueue.trigger()
      .then(_.first);
  },
  loadWorkflow: function () {
    const loadedCycle = this.loadCycle();

    return loadedCycle
      .then((cycle) => {
        const workflow = cycle.attr('workflow');
        return new RefreshQueue().enqueue(workflow).trigger();
      })
      .then(_.first)
      .then((loadedWorkflow) => {
        this.attr('workflow', loadedWorkflow);
      });
  },
});

export default GGRC.Components('cycleTaskGroupObjectTaskWorkflowPreloader', {
  tag: 'cycle-task-workflow-preloader',
  viewModel,
});
