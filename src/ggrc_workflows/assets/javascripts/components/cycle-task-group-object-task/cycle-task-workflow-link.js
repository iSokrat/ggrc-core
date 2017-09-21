/* !
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

'use strict';

import template from './templates/cycle-task-workflow-link.mustache';

const viewModel = can.Map.extend({
  define: {
    showLink: {
      get: function () {
        const workflow = this.attr('workflow');
        const pageInstance = GGRC.page_instance();
        const isWorkflowInstance =
          (workflow.type === pageInstance.type) &&
          (workflow.id === pageInstance.id);
        const isMyWorkPage = GGRC.Utils.CurrentPage.isMyWork();

        return !isWorkflowInstance || isMyWorkPage;
      },
    },
  },
  workflow: {},
});

export default GGRC.Components('cycleTaskGroupObjectTaskWorkflowLink', {
  tag: 'cycle-task-workflow-link',
  template,
  viewModel,
});
