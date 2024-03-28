import { Factory } from 'fishery';

import userPermissionsFactory from './user-permission';
import RenderingPermissionService from '../../../src/permissions/rendering-permission';
import { servequeryAdminClientOptions, servequeryAdminServerInterface } from '../index';

export class RenderingPermissionsFactory extends Factory<RenderingPermissionService> {
  mockAllMethods() {
    return this.afterBuild(permissions => {
      permissions.getScope = jest.fn();
      permissions.canExecuteChart = jest.fn();
      permissions.invalidateCache = jest.fn();
      permissions.invalidateAllCache = jest.fn();
      permissions.canExecuteSegmentQuery = jest.fn();
      permissions.getUser = jest.fn();
      permissions.getTeam = jest.fn();
    });
  }
}

const renderingPermissionsFactory = RenderingPermissionsFactory.define(
  () =>
    new RenderingPermissionService(
      servequeryAdminClientOptions.build(),
      userPermissionsFactory.build(),
      servequeryAdminServerInterface.build(),
    ),
);

export default renderingPermissionsFactory;
