import { ChartHandlerInterface } from '@servequery/servequery-client';

import authorizationServiceFactory from './authorization';
import AuthorizationService from './authorization/authorization';
import Serializer from './serializer';
import { AgentOptionsWithDefaults } from '../types';

export type ServeQueryHttpDriverServices = {
  serializer: Serializer;
  authorization: AuthorizationService;
  chartHandler: ChartHandlerInterface;
};

export default (options: AgentOptionsWithDefaults): ServeQueryHttpDriverServices => {
  return {
    authorization: authorizationServiceFactory(options),
    serializer: new Serializer(),
    chartHandler: options.servequeryAdminClient.chartHandler,
  };
};
