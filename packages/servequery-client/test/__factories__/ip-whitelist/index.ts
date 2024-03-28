import { Factory } from 'fishery';

import IpWhitelistService from '../../../src/ip-whitelist';
import servequeryAdminClientOptions from '../servequery-admin-client-options';

const ipWhitelistServiceFactory = Factory.define<IpWhitelistService>(() => {
  return new IpWhitelistService(servequeryAdminClientOptions.build());
});

export default ipWhitelistServiceFactory;
