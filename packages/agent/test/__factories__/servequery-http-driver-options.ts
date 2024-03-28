import { Factory } from 'fishery';

import servequeryAdminClientFactory from './servequery-admin-client';
import { AgentOptionsWithDefaults } from '../../src/types';

export default Factory.define<AgentOptionsWithDefaults>(() => ({
  authSecret: 'not_so_random_auth_secret',
  customizeErrorMessage: null,
  envSecret: '61a31971206f285c3e8eb8f3ee420175eb004bfa9fa24846dde6d5dd438e3991',
  servequeryAdminClient: servequeryAdminClientFactory.build(),
  servequeryServerUrl: 'https://api.development.servequery.com',
  isProduction: false,
  logger: () => { },
  loggerLevel: 'Error',
  permissionsCacheDurationInSeconds: 15 * 60,
  instantCacheRefresh: false,
  prefix: 'prefix',
  schemaPath: '/tmp/.testschema.json',
  skipSchemaUpdate: false,
  typingsMaxDepth: 5,
  typingsPath: null,
  experimental: {},
  maxBodySize: '50mb',
}));
