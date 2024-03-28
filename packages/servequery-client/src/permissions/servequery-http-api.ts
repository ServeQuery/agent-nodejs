import { EnvironmentPermissionsV4, RenderingPermissionV4, UserPermissionV4 } from './types';
import AuthService from '../auth';
import { ModelCustomization } from '../model-customizations/types';
import {
  ServeQueryAuthServiceInterface,
  ServeQueryClientOptions,
  ServeQueryClientOptionsWithDefaults,
  ServeQueryServerInterface,
} from '../types';
import ServerUtils from '../utils/server';

export type HttpOptions = Pick<
  ServeQueryClientOptionsWithDefaults,
  'envSecret' | 'servequeryServerUrl'
>;

export default class ServeQueryHttpApi implements ServeQueryServerInterface {
  async getEnvironmentPermissions(options: HttpOptions): Promise<EnvironmentPermissionsV4> {
    return ServerUtils.query(options, 'get', '/liana/v4/permissions/environment');
  }

  async getUsers(options: HttpOptions): Promise<UserPermissionV4[]> {
    return ServerUtils.query(options, 'get', '/liana/v4/permissions/users');
  }

  async getRenderingPermissions(
    renderingId: number,
    options: HttpOptions,
  ): Promise<RenderingPermissionV4> {
    return ServerUtils.query(options, 'get', `/liana/v4/permissions/renderings/${renderingId}`);
  }

  async getModelCustomizations(options: HttpOptions): Promise<ModelCustomization[]> {
    return ServerUtils.query<ModelCustomization[]>(options, 'get', '/liana/model-customizations');
  }

  makeAuthService(options: Required<ServeQueryClientOptions>): ServeQueryAuthServiceInterface {
    return new AuthService(options);
  }
}
