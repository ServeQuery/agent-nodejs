import Router from '@koa/router';

import BaseRoute from '../../src/routes/base-route';
import { RouteType } from '../../src/types';
import * as factories from '../__factories__';

describe('Base routes', () => {
  const services = factories.servequeryAdminHttpDriverServices.build();
  const options = factories.servequeryAdminHttpDriverOptions.build();
  const router = factories.router.mockAllMethods().build();

  test('should not register any route', async () => {
    const Route = class extends BaseRoute {
      type = RouteType.PublicRoute;
      setupRoutes(aRouter: Router): void {
        void aRouter;
      }
    };

    const baseRoute = new Route(services, options);
    await baseRoute.bootstrap();
    baseRoute.setupRoutes(router);

    expect(router.get).not.toHaveBeenCalled();
    expect(router.post).not.toHaveBeenCalled();
    expect(router.put).not.toHaveBeenCalled();
    expect(router.delete).not.toHaveBeenCalled();
    expect(router.use).not.toHaveBeenCalled();
  });
});
