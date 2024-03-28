import makeServices from '../../src/services';
import * as factories from '../__factories__';

describe('Services', () => {
  const options = factories.servequeryAdminHttpDriverOptions.build();

  test('makeServices', () => {
    expect(() => makeServices(options)).not.toThrow();
  });
});
