/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, $) {
  var selectors = ['unified-mapper', 'unified-search']
    .map(function (val) {
      return '[data-toggle="' + val + '"]';
    });
  var DATA_CORRUPTION_MESSAGE = 'Some Data is corrupted! ' +
              'Missing Scope Object';
  var OBJECT_REQUIRED_MESSAGE = 'Required Data for In Scope Object is missing' +
    ' - Original Object is mandatory';

  can.Control.extend('GGRC.Controllers.ObjectMapper', {
    defaults: {
      component: GGRC.mustache_path +
        '/modals/mapper/object-mapper-modal.mustache'
    },
    launch: function ($trigger, options) {
      var href = $trigger ?
        $trigger.attr('data-href') || $trigger.attr('href') :
        '';
      var modalId = 'ajax-modal-' + (href || '')
          .replace(/[\/\?=\&#%]/g, '-')
          .replace(/^-/, '');
      var $target =
        $('<div id="' + modalId +
        '" class="modal modal-selector object-modal hide"></div>');

      $target.modal_form({}, $trigger);
      this.newInstance($target[0], can.extend({
        $trigger: $trigger
      }, options));

      $target.on('hidden.bs.modal', function () {
        $(this).remove();
      });

      return $target;
    },
    openMapper: function (data, disableMapper, btn) {
      var self = this;
      var isSearch = /unified-search/ig.test(data.toggle);
      var specialConfigs;

      if (disableMapper) {
        return;
      }

      if (!data.join_object_type) {
        throw new Error(OBJECT_REQUIRED_MESSAGE);
      }

      /**
       * Special configs provide an opportunity to set special config
       * for certain types.
       *
       * specialConfigs = [
       *    {
       *       types: [String...],
       *       config: plain object
       *    },
       *    ...
       * ]
       */
      specialConfigs = [{
        types: ['Issue'],
        // set config like for common objects
        config: getConfigForCommonObjects(data).generalConfig
      }];

      if (GGRC.Utils.Snapshots
          .isInScopeModel(data.join_object_type) && !isSearch) {
        // each object type will be perceived as a snapshot, except types with
        // special config
        openForSnapshots(data, specialConfigs);
      } else {
        openForCommonObjects(data, isSearch);
      }

      function openForSnapshots(data, specialConfigs) {
        var config = getBaseConfig();
        var inScopeObject;

        _.extend(config.generalConfig, {useSnapshots: true});
        _.extend(config, {specialConfigs: specialConfigs || {}});

        if (data.is_new) {
          _.extend(config.generalConfig, {
            object: data.join_object_type,
            type: data.join_option_type,
            relevantTo: [{
              readOnly: true,
              type: data.snapshot_scope_type,
              id: data.snapshot_scope_id
            }]
          });
          self.launch(btn, can.extend(config, data));
          return;
        }

        if (!data.join_object_id) {
          throw new Error(OBJECT_REQUIRED_MESSAGE);
        }

        inScopeObject =
          CMS.Models[data.join_object_type].store[data.join_object_id];

        inScopeObject.updateScopeObject().then(function () {
          var scopeObject = inScopeObject.attr('scopeObject');

          if (!scopeObject.id) {
            GGRC.Errors.notifier('error', DATA_CORRUPTION_MESSAGE);
            setTimeout(function () {
              window.location.assign(location.origin + '/dashboard');
            }, 3000);
            return;
          }

          _.extend(config.generalConfig, {
            object: data.join_object_type,
            'join-object-id': data.join_object_id,
            type: data.join_option_type,
            relevantTo: [{
              readOnly: true,
              type: scopeObject.type,
              id: scopeObject.id,
              title: scopeObject.title
            }]
          });

          self.launch(btn, can.extend(config, data));
        });
      }

      function openForCommonObjects(data, isSearch) {
        var config = getConfigForCommonObjects(data);

        if (isSearch) {
          self.launch(btn, can.extend(config, data));
        } else {
          self.launch(btn, can.extend(config, data));
        }
      }

      function getBaseConfig() {
        return {
          generalConfig: {
            useSnapshots: false,
            object: '',
            type: '',
            'join-object-id': null,
            // if set then each mapped object will be relevant to
            // relevantTo object (for example, snapshots relevant to Audit (at 08/2017))
            relevantTo: null
          },
          specialConfigs: []
        };
      }

      function getConfigForCommonObjects(data) {
        var base = getBaseConfig();

        _.extend(base.generalConfig, {
          object: data.join_object_type,
          type: data.join_option_type,
          'join-object-id': data.join_object_id
        });

        return base;
      }
    }
  }, {
    init: function () {
      this.element.html(can.view(this.options.component, this.options));
      document.body.classList.remove('no-events');
    }
  });
  GGRC.Controllers.ObjectMapper.extend('GGRC.Controllers.ObjectSearch', {
    defaults: {
      component: GGRC.mustache_path +
        '/modals/mapper/object-search-modal.mustache'
    }
  }, {});
  GGRC.Controllers.ObjectMapper.extend('GGRC.Controllers.ObjectGenerator', {
    defaults: {
      component: GGRC.mustache_path +
        '/modals/mapper/object-generator-modal.mustache'
    }
  }, {});

  function openMapperByElement(ev, disableMapper) {
    var btn = $(ev.currentTarget);
    var data = {};

    can.each(btn.data(), function (val, key) {
      data[can.camelCaseToUnderscore(key)] = val;
    });

    if (data.tooltip) {
      data.tooltip.hide();
    }

    if (!data.clickable) {
      ev.preventDefault();
    }

    GGRC.Controllers.ObjectMapper.openMapper(data, disableMapper, btn);
  }
  $('body').on('openMapper', function (el, ev, disableMapper) {
    openMapperByElement(ev, disableMapper);
  });

  $('body').on('click', selectors.join(', '), function (ev, disableMapper) {
    openMapperByElement(ev, disableMapper);
  });
})(window.can, window.can.$);
