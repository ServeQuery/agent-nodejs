import { Factory } from 'fishery';

import ModelCustomizationFromApiService from '../../../src/model-customizations/model-customization-from-api';
import servequeryAdminClientOptionsFactory from '../servequery-admin-client-options';
import { servequeryAdminServerInterface } from '../index';

export class ModelCustomizationServiceFactory extends Factory<ModelCustomizationFromApiService> {
  mockAllMethods() {
    return this.afterBuild(client => {
      client.getConfiguration = jest.fn();
    });
  }
}

const modelCustomizationServiceFactory = ModelCustomizationServiceFactory.define(
  () =>
    new ModelCustomizationFromApiService(
      servequeryAdminServerInterface.build(),
      servequeryAdminClientOptionsFactory.build(),
    ),
);

export default modelCustomizationServiceFactory;
