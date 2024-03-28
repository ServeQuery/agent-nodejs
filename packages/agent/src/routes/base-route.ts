import Router from '@koa/router';

import { ServeQueryHttpDriverServices } from '../services';
import { AgentOptionsWithDefaults, RouteType } from '../types';

export default abstract class BaseRoute {
  protected readonly services: ServeQueryHttpDriverServices;
  protected readonly options: AgentOptionsWithDefaults;

  abstract get type(): RouteType;

  constructor(services: ServeQueryHttpDriverServices, options: AgentOptionsWithDefaults) {
    this.services = services;
    this.options = options;
  }

  async bootstrap(): Promise<void> {
    // Do nothing by default
  }

  abstract setupRoutes(router: Router): void;

  protected escapeUrlSlug(name: string): string {
    return encodeURI(name).replace(/([+?*])/g, '\\$1');
  }
}
