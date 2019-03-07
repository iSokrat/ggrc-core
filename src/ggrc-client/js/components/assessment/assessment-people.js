/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import './request-review/request-review';
import {ROLES_CONFLICT} from '../../events/eventTypes';
import '../custom-roles/custom-roles';
import '../custom-roles/custom-roles-modal';
import template from './templates/assessment-people.stache';

const tag = 'assessment-people';

export default can.Component.extend({
  tag,
  template,
  leakScope: true,
  viewModel: {
    define: {
      emptyMessage: {
        type: 'string',
        value: '',
      },
      reviewGroups: {
        get() {
          return [
            {
              title: 'Internat 1st Rewiever',
              groupId: 72,
              people: [
                {
                  id: 2,
                  email: 'user@example.com',
                  name: 'user@example.com',
                  type: 'Person',
                },
                {
                  id: 3,
                  email: 'example@example.com',
                  name: 'asdasdas',
                  type: 'Person',
                },
              ],
              reviewed: true,
              disabled: false,
            },
            {
              title: 'Internat 2nd Rewiever',
              groupId: 76,
              people: [
                {
                  id: 2,
                  email: 'user@example.com',
                  name: 'user@example.com',
                  type: 'Person',
                },
              ],
              reviewed: false,
              disabled: false,
            },
            {
              title: 'Internat 3rd Rewiever',
              groupId: 3,
              people: [],
              reviewed: false,
              disabled: false,
            },
            {
              title: 'EY Reviewer #1',
              groupId: 4,
              people: [],
              reviewed: false,
              disabled: true,
            },
            {
              title: 'EY Reviewer #2',
              groupId: 73,
              people: [
              ],
              reviewed: false,
              disabled: true,
            },
          ];
        },
      },
    },
    rolesConflict: false,
    infoPaneMode: true,
    instance: {},
    conflictRoles: ['Assignees', 'Verifiers'],
    orderOfRoles: ['Creators', 'Assignees', 'Verifiers'],
    modalState: {
      open: false,
    },
    requestReview(ev) {
      this.attr('modalState.open', ev.modalState.open);
    },
  },
  events: {
    [`{instance} ${ROLES_CONFLICT.type}`]: function (ev, args) {
      this.viewModel.attr('rolesConflict', args.rolesConflict);
    },
  },
});
