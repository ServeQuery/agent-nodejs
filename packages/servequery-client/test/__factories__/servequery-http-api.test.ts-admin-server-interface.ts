import { Factory } from 'fishery';

import { ServeQueryServerInterface } from '../../src/types';

export default Factory.define<ServeQueryServerInterface>(() => ({
  getRenderingPermissions: jest.fn(),
  getEnvironmentPermissions: jest.fn(),
  getUsers: jest.fn(),
  getModelCustomizations: jest.fn(),
  makeAuthService: jest.fn(),
}));
