import ServeQueryHttpApi from '../../src/permissions/servequery-http-api';
import ServerUtils from '../../src/utils/server';
import * as factories from '../__factories__';

jest.mock('../../src/utils/server', () => ({
  query: jest.fn(),
}));

describe('ServeQueryHttpApi', () => {
  const options = factories.servequeryAdminClientOptions.build();

  test('getEnvironmentPermissions should call the right endpoint', async () => {
    await new ServeQueryHttpApi().getEnvironmentPermissions(options);

    expect(ServerUtils.query).toHaveBeenCalledWith(
      options,
      'get',
      '/liana/v4/permissions/environment',
    );
  });

  test('getUsers should call the right endpoint', async () => {
    await new ServeQueryHttpApi().getUsers(options);

    expect(ServerUtils.query).toHaveBeenCalledWith(options, 'get', '/liana/v4/permissions/users');
  });

  test('getRenderingPermissions should call the right endpoint', async () => {
    await new ServeQueryHttpApi().getRenderingPermissions(42, options);

    expect(ServerUtils.query).toHaveBeenCalledWith(
      options,
      'get',
      '/liana/v4/permissions/renderings/42',
    );
  });

  describe('getModelCustomizations', () => {
    it('should call the right endpoint', async () => {
      await new ServeQueryHttpApi().getModelCustomizations(options);

      expect(ServerUtils.query).toHaveBeenCalledWith(options, 'get', '/liana/model-customizations');
    });
  });
});
