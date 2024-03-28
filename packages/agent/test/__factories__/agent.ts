import { Factory } from 'fishery';

import servequeryAdminHttpDriverOptions from './servequery-admin-http-driver-options';
import Agent from '../../src/agent';

export default Factory.define<Agent>(() => new Agent(servequeryAdminHttpDriverOptions.build()));
