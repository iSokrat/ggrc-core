/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Person from '../../models/business-models/person';
import PersonProfile from '../../models/service-models/person-profile';
import RefreshQueue from '../../models/refresh_queue';
import {getPageInstance} from './current-page-utils';
import {notifier} from './notifiers-utils';

function cacheCurrentUser() {
  Person.model(GGRC.current_user);
}

function loadPersonProfile(person) {
  return PersonProfile.findOne({
    id: person.attr('profile.id'),
  });
}

function getUserRoles(person) {
  let parentInstance = getPageInstance();

  let roles = {};
  let allRoleNames = [];

  _.forEach(GGRC.access_control_roles, (role) => {
    roles[role.id] = role;
  });

  if (parentInstance && parentInstance.access_control_list) {
    allRoleNames = _.uniq(parentInstance.access_control_list.filter((acl) => {
      return acl.person.id === person.id && acl.ac_role_id in roles;
    }).map((acl) => {
      return roles[acl.ac_role_id].name;
    }));
  } else {
    let globalRole = person.system_wide_role === 'No Access' ?
      'No Role' : person.system_wide_role;
    allRoleNames = [globalRole];
  }
  return allRoleNames;
}

export {
  cacheCurrentUser,
  loadPersonProfile,
  getUserRoles,
};
