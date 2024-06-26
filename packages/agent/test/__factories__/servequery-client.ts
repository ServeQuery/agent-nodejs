import type { ServeQueryClient } from '@servequery/servequery-client';

import { Factory } from 'fishery';

export class ServeQueryClientFactory extends Factory<ServeQueryClient> { }

const servequeryAdminClientFactory = ServeQueryClientFactory.define(() => ({
  verifySignedActionParameters: jest.fn(),
  canExecuteChart: jest.fn(),
  getScope: jest.fn(),
  markScopesAsUpdated: jest.fn(),
  getIpWhitelistConfiguration: jest.fn(),
  postSchema: jest.fn(),
  authService: {
    init: jest.fn(),
    getUserInfo: jest.fn(),
    generateAuthorizationUrl: jest.fn(),
    generateTokens: jest.fn(),
  },
  permissionService: {
    canExecuteSegmentQuery: jest.fn(),
    canApproveCustomAction: jest.fn(),
    canOnCollection: jest.fn(),
    canRequestCustomActionParameters: jest.fn(),
    canExecuteChart: jest.fn(),
    canTriggerCustomAction: jest.fn(),
    doesTriggerCustomActionRequiresApproval: jest.fn(),
    getConditionalTriggerCondition: jest.fn(),
    getConditionalRequiresApprovalCondition: jest.fn(),
    getConditionalApproveCondition: jest.fn(),
    getConditionalApproveConditions: jest.fn(),
    getRoleIdsAllowedToApproveWithoutConditions: jest.fn(),
  },
  contextVariablesInstantiator: {
    buildContextVariables: jest.fn(),
  },
  chartHandler: {
    getChartWithContextInjected: jest.fn(),
    getQueryForChart: jest.fn(),
  },
  getOpenIdClient: jest.fn(),
  getUserInfo: jest.fn(),
  modelCustomizationService: {
    getConfiguration: jest.fn(),
  },
  subscribeToServerEvents: jest.fn(),
  close: jest.fn(),
  onRefreshCustomizations: jest.fn(),
}));

export default servequeryAdminClientFactory;
