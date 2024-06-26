import { Caller, DataSource } from '@servequery/datasource-toolkit';

import RelaxedCollection from './collection';
import { TCollectionName, TSchema } from '../../templates';

/** DataSource wrapper which accepts plain objects in all methods */
export default class RelaxedDataSource<S extends TSchema = TSchema> {
  private dataSource: DataSource;
  private caller: Caller;

  constructor(dataSource: DataSource, caller: Caller) {
    this.dataSource = dataSource;
    this.caller = caller;
  }

  /**
   * Get a collection from a datasource
   * @param name the name of the collection
   */
  getCollection<N extends TCollectionName<S>>(name: N): RelaxedCollection<S, N> {
    return new RelaxedCollection(this.dataSource.getCollection(name), this.caller);
  }
}
