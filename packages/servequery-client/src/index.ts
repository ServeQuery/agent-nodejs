import buildApplicationServices from './build-application-services';
import ServeQueryClientWithCache from './servequery-admin-client-with-cache';
import ServeQueryHttpApi from './permissions/servequery-http-api';
import { ServeQueryClient, ServeQueryClientOptions } from './types';

export { default as JTWTokenExpiredError } from './permissions/errors/jwt-token-expired-error';
export { default as JTWUnableToVerifyError } from './permissions/errors/jwt-unable-to-verify-error';
export { default as ChainedSQLQueryError } from './permissions/errors/chained-sql-query-error';
export { default as EmptySQLQueryError } from './permissions/errors/empty-sql-query-error';
export { default as NonSelectSQLQueryError } from './permissions/errors/non-select-sql-query-error';
export {
  ServeQueryClientOptions,
  Logger,
  LoggerLevel,
  ServeQueryClient,
  ChartHandlerInterface,
  ContextVariablesInstantiatorInterface,
  RawTree,
  RawTreeWithSources,
  ServeQueryServerInterface,
} from './types';
export { IpWhitelistConfiguration } from './ip-whitelist/types';

// These types are used for the agent-generator package
export {
  CollectionActionEvent,
  EnvironmentPermissionsV4,
  RenderingPermissionV4,
  UserPermissionV4,
} from './permissions/types';
export { UserInfo } from './auth/types';

export default function createServeQueryClient(
  options: ServeQueryClientOptions,
): ServeQueryClient {
  const {
    optionsWithDefaults,
    permission,
    renderingPermission,
    contextVariables,
    chartHandler,
    ipWhitelist,
    schema,
    auth,
    modelCustomizationService,
    eventsSubscription,
    eventsHandler,
  } = buildApplicationServices(new ServeQueryHttpApi(), options);

  return new ServeQueryClientWithCache(
    optionsWithDefaults,
    permission,
    renderingPermission,
    contextVariables,
    chartHandler,
    ipWhitelist,
    schema,
    auth,
    modelCustomizationService,
    eventsSubscription,
    eventsHandler,
  );
}

export * from './charts/types';
export * from './schema/types';
export * from './model-customizations/types';

export { default as ContextVariablesInjector } from './utils/context-variables-injector';
export { default as ContextVariables } from './utils/context-variables';
export { default as ChartHandler } from './charts/chart-handler';
export { default as ServeQueryClientWithCache } from './servequery-admin-client-with-cache';
export { default as buildApplicationServices } from './build-application-services';

// export is necessary for the agent-generator package
export { default as SchemaService } from './schema';

export * from './auth/errors';
