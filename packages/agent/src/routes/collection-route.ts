import { Collection, DataSource } from '@servequery/datasource-toolkit';

import BaseRoute from './base-route';
import { ServeQueryHttpDriverServices } from '../services';
import { AgentOptionsWithDefaults, RouteType } from '../types';

export default abstract class CollectionRoute extends BaseRoute {
  type = RouteType.PrivateRoute;

  private readonly collectionName: string;
  protected readonly dataSource: DataSource;

  protected get collection(): Collection {
    return this.dataSource.getCollection(this.collectionName);
  }

  protected get collectionUrlSlug(): string {
    return this.escapeUrlSlug(this.collectionName);
  }

  constructor(
    services: ServeQueryHttpDriverServices,
    options: AgentOptionsWithDefaults,
    dataSource: DataSource,
    collectionName: string,
  ) {
    super(services, options);
    this.collectionName = collectionName;
    this.dataSource = dataSource;
  }
}
