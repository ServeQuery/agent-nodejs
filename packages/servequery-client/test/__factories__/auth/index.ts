import { Factory } from 'fishery';

import AuthService from '../../../src/auth';
import servequeryAdminClientOptions from '../servequery-admin-client-options';

const authServiceFactory = Factory.define<AuthService>(() => {
  return new AuthService(servequeryAdminClientOptions.build());
});

export default authServiceFactory;
