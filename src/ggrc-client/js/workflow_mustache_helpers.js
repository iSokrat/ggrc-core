/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import RefreshQueue from './models/refresh_queue';
import Permission from './permission';

(function (can, $) {
  let Mustache = can.Mustache;
  /*
   sort_index_at_end mustache helper

   Given a list of items with a sort_index property, or a list of
   bindings with instances having a sort_index property, return
   a sort_index value suitable for placing a new item in the list
   at the end when sorted.

   @helper_type string -- use within attribute or outside of element

   @param list a list of objects or bindings
   */
  Mustache.registerHelper('sort_index_at_end', function (list, options) {
    let max_int = Number.MAX_SAFE_INTEGER.toString(10);
    let list_max = '0';

    list = Mustache.resolve(list);
    can.each(list, function (item) {
      let idx;
      if (item.reify) {
        item = item.reify();
      }
      idx = item.attr
        ? (item.attr('sort_index') || item.attr('instance.sort_index'))
        : item.sort_index || item.instance && (item.instance.attr
        ? item.instance.attr('sort_index')
        : item.instance.sort_index);
      if (typeof idx !== 'undefined') {
        list_max = GGRC.Math.string_max(idx, list_max);
      }
    });

    return GGRC.Math.string_half(GGRC.Math.string_add(list_max, max_int));
  });

  /*
   if_recurring_workflow mustache helper

   Given an object, it  determines if it's a workflow, and if it's a recurring
   workflow or not.

   @param object - the object we want to check
   */
  Mustache.registerHelper('if_recurring_workflow', function (object, options) {
    object = Mustache.resolve(object);
    if (object.type === 'Workflow' &&
        _.includes(['day', 'week', 'month'],
                   object.unit)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
})(window.can, window.can.$);
