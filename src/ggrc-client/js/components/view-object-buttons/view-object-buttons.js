/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './view-object-buttons.mustache';

export default can.Component.extend({
  tag: 'view-object-buttons',
  template,
  viewModel: {
    instance: null,
    openIsHidden: false,
    viewIsHidden: false,
    maximizeObject: function (scope, el, ev) {
      let tree = el.closest('.cms_controllers_tree_view_node');
      let node = tree.control();
      ev.preventDefault();
      ev.stopPropagation();
      if (node) {
        node.select(true);
      }
    },
    openObject: function (scope, el, ev) {
      ev.stopPropagation();
    },
  },
});
