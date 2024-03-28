import { Factory } from 'fishery';

import CustomizationPluginService from '../../../src/services/model-customizations/customization';
import servequeryAdminHttpDriverOptions from '../servequery-admin-http-driver-options';

export class CustomizationPluginServiceFactory extends Factory<CustomizationPluginService> {
  mockAllMethods() {
    return this.afterBuild(CustomizationPlugin => {
      CustomizationPlugin.addCustomizations = jest.fn();
      CustomizationPlugin.buildFeatures = jest.fn();
    });
  }
}

const customizationPluginServiceFactory = CustomizationPluginServiceFactory.define(
  () => new CustomizationPluginService(servequeryAdminHttpDriverOptions.build()),
);

export default customizationPluginServiceFactory;
