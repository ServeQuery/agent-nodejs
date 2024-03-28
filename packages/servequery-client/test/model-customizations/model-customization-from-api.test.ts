import ModelCustomizationService from '../../src/model-customizations/model-customization-from-api';
import { ActionScope, ModelCustomization } from '../../src/model-customizations/types';
import { servequeryAdminServerInterface } from '../__factories__';
import servequeryadminClientOptionsFactory from '../__factories__/servequery-admin-client-options';

describe('ModelCustomizationFromApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfiguration', () => {
    describe('with actions', () => {
      describe('with webhooks', () => {
        it.each(['Global', 'Bulk', 'Single'] as ActionScope[])(
          'should retrieve the configuration from the API and map values for the scope %s',
          async scope => {
            const servequeryadminServer = servequeryAdminServerInterface.build();
            (servequeryadminServer.getModelCustomizations as jest.Mock).mockResolvedValueOnce([
              {
                name: 'test',
                type: 'action',
                modelName: 'myModel',
                configuration: {
                  type: 'webhook',
                  scope: scope.toLowerCase(),
                  configuration: {
                    url: 'https://my-url.com',
                    integration: 'service',
                  },
                },
              },
            ] as ModelCustomization[]);

            const options = servequeryadminClientOptionsFactory.build();

            const modelCustomizations = new ModelCustomizationService(servequeryadminServer, options);

            const configuration = await modelCustomizations.getConfiguration();

            expect(configuration).toStrictEqual([
              {
                name: 'test',
                type: 'action',
                modelName: 'myModel',
                configuration: {
                  type: 'webhook',
                  scope,
                  configuration: {
                    url: 'https://my-url.com',
                    integration: 'service',
                  },
                },
              },
            ]);

            expect(servequeryadminServer.getModelCustomizations).toHaveBeenCalledTimes(1);
            expect(servequeryadminServer.getModelCustomizations).toHaveBeenCalledWith(options);
          },
        );
      });
    });

    describe('with unsupported types', () => {
      it('should throw an error', async () => {
        const options = servequeryadminClientOptionsFactory.build();
        const servequeryadminServer = servequeryAdminServerInterface.build();

        (servequeryadminServer.getModelCustomizations as jest.Mock).mockResolvedValueOnce([
          {
            name: 'test',
            type: 'unsupported',
            modelName: 'myModel',
            configuration: {},
          },
        ]);

        const modelCustomizations = new ModelCustomizationService(servequeryadminServer, options);

        await expect(modelCustomizations.getConfiguration()).rejects.toThrow(
          'Only action customizations are supported for now.',
        );
      });
    });
  });
});
