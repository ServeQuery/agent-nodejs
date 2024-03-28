import {
  ActionConfigurationApi,
  ActionScope,
  ConfigurationApi,
  ModelCustomization,
  ModelCustomizationService,
  ModelCustomizationType,
} from './types';
import { ServeQueryClientOptionsWithDefaults, ServeQueryServerInterface } from '../types';

function mapApiValues(
  modelCustomization: ModelCustomization<ConfigurationApi>,
): ModelCustomization {
  switch (modelCustomization.type) {
    case ModelCustomizationType.action: {
      const configuration = modelCustomization.configuration as ActionConfigurationApi;
      const mappedConfiguration = {
        ...configuration,
        scope: configuration.scope
          ? ((configuration.scope.slice(0, 1).toUpperCase() +
            configuration.scope.slice(1)) as ActionScope)
          : 'Single',
      };

      return {
        ...modelCustomization,
        configuration: mappedConfiguration,
      };
    }

    default:
      throw new Error('Only action customizations are supported for now.');
  }
}

export default class ModelCustomizationFromApiService implements ModelCustomizationService {
  constructor(
    private readonly servequeryadminServerInterface: ServeQueryServerInterface,
    private readonly options: ServeQueryClientOptionsWithDefaults,
  ) { }

  async getConfiguration(): Promise<ModelCustomization[]> {
    const result = await this.servequeryadminServerInterface.getModelCustomizations(this.options);

    return result.map(mapApiValues);
  }
}
