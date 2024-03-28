import { Factory } from 'fishery';

import UserPermissionService from '../../../src/permissions/user-permission';
import { servequeryAdminClientOptions, servequeryAdminServerInterface } from '../index';

export class UserPermissionsFactory extends Factory<UserPermissionService> {
  mockAllMethods() {
    return this.afterBuild(permissions => {
      permissions.getUserInfo = jest.fn();
      permissions.invalidateCache = jest.fn();
    });
  }
}

const userPermissionsFactory = UserPermissionsFactory.define(
  () =>
    new UserPermissionService(servequeryAdminClientOptions.build(), servequeryAdminServerInterface.build()),
);

export default userPermissionsFactory;
