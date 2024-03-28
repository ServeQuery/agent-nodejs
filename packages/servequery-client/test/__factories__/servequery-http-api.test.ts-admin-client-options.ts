import { Factory } from 'fishery';

import { ServeQueryClientOptionsWithDefaults } from '../../src/types';

export default Factory.define<ServeQueryClientOptionsWithDefaults>(() => ({
  envSecret: '61a31971206f285c3e8eb8f3ee420175eb004bfa9fa24846dde6d5dd438e3991',
  servequeryServerUrl: 'https://api.development.servequery.com',
  permissionsCacheDurationInSeconds: 15 * 60,
  instantCacheRefresh: true,
  experimental: null,
  logger: jest.fn(),
}));
