import ChartHandler from './charts/chart-handler';
import EventsSubscriptionService from './events-subscription';
import NativeRefreshEventsHandlerService from './events-subscription/native-refresh-events-handler-service';
import { RefreshEventsHandlerService } from './events-subscription/types';
import IpWhiteListService from './ip-whitelist';
import ModelCustomizationFromApiService from './model-customizations/model-customization-from-api';
import { ModelCustomizationService } from './model-customizations/types';
import ActionPermissionService from './permissions/action-permission';
import PermissionService from './permissions/permission-with-cache';
import RenderingPermissionService from './permissions/rendering-permission';
import UserPermissionService from './permissions/user-permission';
import SchemaService from './schema';
import {
  ServeQueryAuthServiceInterface,
  ServeQueryClientOptions,
  ServeQueryClientOptionsWithDefaults,
  ServeQueryServerInterface,
} from './types';
import ContextVariablesInstantiator from './utils/context-variables-instantiator';
import defaultLogger from './utils/default-logger';

export default function buildApplicationServices(
  servequeryAdminServerInterface: ServeQueryServerInterface,
  options: ServeQueryClientOptions,
): {
  optionsWithDefaults: ServeQueryClientOptionsWithDefaults;
  renderingPermission: RenderingPermissionService;
  schema: SchemaService;
  contextVariables: ContextVariablesInstantiator;
  ipWhitelist: IpWhiteListService;
  permission: PermissionService;
  chartHandler: ChartHandler;
  auth: ServeQueryAuthServiceInterface;
  modelCustomizationService: ModelCustomizationService;
  eventsSubscription: EventsSubscriptionService;
  eventsHandler: RefreshEventsHandlerService;
} {
  const optionsWithDefaults = {
    servequeryServerUrl: 'https://api.servequery.com',
    permissionsCacheDurationInSeconds: 15 * 60,
    logger: defaultLogger,
    instantCacheRefresh: true,
    experimental: null,
    ...options,
  };

  const usersPermission = new UserPermissionService(
    optionsWithDefaults,
    servequeryAdminServerInterface,
  );

  const renderingPermission = new RenderingPermissionService(
    optionsWithDefaults,
    usersPermission,
    servequeryAdminServerInterface,
  );

  const actionPermission = new ActionPermissionService(
    optionsWithDefaults,
    servequeryAdminServerInterface,
  );

  const contextVariables = new ContextVariablesInstantiator(renderingPermission);

  const permission = new PermissionService(actionPermission, renderingPermission);

  const eventsHandler = new NativeRefreshEventsHandlerService(
    actionPermission,
    usersPermission,
    renderingPermission,
  );

  const eventsSubscription = new EventsSubscriptionService(optionsWithDefaults, eventsHandler);

  return {
    renderingPermission,
    optionsWithDefaults,
    permission,
    contextVariables,
    eventsSubscription,
    eventsHandler,
    chartHandler: new ChartHandler(contextVariables),
    ipWhitelist: new IpWhiteListService(optionsWithDefaults),
    schema: new SchemaService(optionsWithDefaults),
    auth: servequeryAdminServerInterface.makeAuthService(optionsWithDefaults),
    modelCustomizationService: new ModelCustomizationFromApiService(
      servequeryAdminServerInterface,
      optionsWithDefaults,
    ),
  };
}
