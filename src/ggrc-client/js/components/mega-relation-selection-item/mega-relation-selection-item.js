/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './mega-relation-selection-item.stache';

export default can.Component.extend({
  tag: 'mega-relation-selection-item',
  template,
  leakScope: false,
  viewModel: {
    mapAsChild: null,
    isDisabled: false,
    id: null,
  },
  events: {
    inserted(el) {
      const val = this.viewModel.attr('mapAsChild');
      const trueBox = el[0].querySelector('[value=true]');
      const falseBox = el[0].querySelector('[value=false]');

      trueBox.checked = val === null ? false : !!val;
      falseBox.checked = val === null ? false : !val;
    },
    click: function (el, ev) {
      let val = el[0].querySelector('input[type=radio]:checked').value;
      val = val === 'true' ? true : (val === 'false' ? false : val);

      can.trigger(this.element, 'mapAsChild', {
        id: this.viewModel.attr('id'),
        val: val === true ? 'child' : 'parent',
      });

      // to prevent expanding of a row in mapper
      ev.stopPropagation();
    },
  },
});
