/* !
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './object-change-state.mustache';

const viewModel = can.Map.extend({
  define: {
    title: {
      type: 'string',
      value: '1',
    },
    toState: {
      type: 'string',
      value: '',
    },
  },
  instance: null,
  changeState: function (newState) {
    this.dispatch({
      type: 'onStateChange',
      state: newState,
    });
  },
});

export default GGRC.Components('objectChangeState', {
  tag: 'object-change-state',
  template,
  viewModel,
});
