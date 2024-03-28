import { Factory } from 'fishery';

import authServiceFactory from './auth';
import chartHandlerFactory from './chart/chart-handler';
import eventsSubscriptionServiceFactory from './events-subscription';
import nativeRefreshEventsHandlerServiceFactory from './events-subscription/native-refresh-events-handler-service';
import servequeryAdminClientOptionsFactory from './servequery-admin-client-options';
import ipWhitelistServiceFactory from './ip-whitelist';
import modelCustomizationServiceFactory from './model-customizations/model-customization-from-api';
import permissionServiceFactory from './permissions/permission';
import renderingPermissionsFactory from './permissions/rendering-permission';
import schemaServiceFactory from './schema';
import contextVariablesInstantiatorFactory from './utils/context-variables-instantiator';
import ServeQueryClient from '../../src/servequery-admin-client-with-cache';

export class ServeQueryClientFactory extends Factory<ServeQueryClient> {
  mockAllMethods() {
    return this.afterBuild(client => {
      client.getScope = jest.fn();
      client.markScopesAsUpdated = jest.fn();
      client.verifySignedActionParameters = jest.fn();
    });
  }
}

const servequeryAdminClientFactory = ServeQueryClientFactory.define(
  () =>
    new ServeQueryClient(
      servequeryAdminClientOptionsFactory.build(),
      permissionServiceFactory.build(),
      renderingPermissionsFactory.build(),
      contextVariablesInstantiatorFactory.build(),
      chartHandlerFactory.build(),
      ipWhitelistServiceFactory.build(),
      schemaServiceFactory.build(),
      authServiceFactory.build(),
      modelCustomizationServiceFactory.build(),
      eventsSubscriptionServiceFactory.build(),
      nativeRefreshEventsHandlerServiceFactory.build(),
    ),
);

export default servequeryAdminClientFactory;
