import { Factory } from 'fishery';

import SchemaService from '../../../src/schema';
import servequeryAdminClientOptions from '../servequery-admin-client-options';

const schemaServiceFactory = Factory.define<SchemaService>(() => {
  return new SchemaService(servequeryAdminClientOptions.build());
});

export default schemaServiceFactory;
