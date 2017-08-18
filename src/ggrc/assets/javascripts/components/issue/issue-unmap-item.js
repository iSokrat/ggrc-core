/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, GGRC) {
  'use strict';

  GGRC.Components('issueUnmapItem', {
    tag: 'issue-unmap-item',
    template: can.view(
      GGRC.mustache_path +
      '/components/issue/issue-unmap-item.mustache'
    ),
    viewModel: {
      issueInstance: {},
      target: {},
      showRelatedObjects: false,
      canUnmap: function () {
        return GGRC.Utils.allowed_to_map(this.attr('issueInstance'),
          this.attr('target'), {}, true);
      },
      unmap: function () {
        if (this.attr('target.type') === 'Audit' &&
          !this.attr('issueInstance.allow_unmap_from_audit')) {
          console.error('allow_unmap_from_audit!!!!');
          this.attr('showRelatedAssessments', true);
          return;
        }

        this.dispatch('unmapIssue');
      },
      modalClossed: function () {
        this.attr('showRelatedAssessments', false);
      }
    },
    events: {
      click: function (el, ev) {
        this.viewModel.unmap();
        ev.preventDefault();
      }
    }
  });
})(window.can, window.GGRC);
