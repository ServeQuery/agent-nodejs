import { Factory } from 'fishery';

import factoryAuthorization from './authorization/authorization';
import factorySerializer from './serializer';
import { ServeQueryHttpDriverServices } from '../../src/services';

export default Factory.define<ServeQueryHttpDriverServices>(() => ({
  serializer: factorySerializer.build(),
  authorization: factoryAuthorization.mockAllMethods().build(),
  chartHandler: {
    getChartWithContextInjected: jest.fn(),
    getQueryForChart: jest.fn(),
  },
}));
