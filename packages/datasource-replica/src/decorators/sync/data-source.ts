import type { ResolvedOptions } from '../../types';
import type { DataSource } from '@servequery/datasource-toolkit';

import { DataSourceDecorator } from '@servequery/datasource-toolkit';

import SyncCollectionDecorator from './collection';

export default class TriggerSyncDataSourceDecorator extends DataSourceDecorator<SyncCollectionDecorator> {
  options: ResolvedOptions;

  constructor(childDataSource: DataSource, options: ResolvedOptions) {
    super(childDataSource, SyncCollectionDecorator);

    this.options = options;
  }
}
