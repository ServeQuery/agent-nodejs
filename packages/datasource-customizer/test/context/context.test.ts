import { Caller, Collection } from '@servequery/datasource-toolkit';
import * as factories from '@servequery/datasource-toolkit/dist/test/__factories__';

import CollectionCustomizationContext from '../../src/context/collection-context';
import RelaxedCollection from '../../src/context/relaxed-wrappers/collection';
import RelaxedDataSource from '../../src/context/relaxed-wrappers/datasource';

describe('Context', () => {
  let collection: Collection;
  let caller: Caller;
  let context: CollectionCustomizationContext;

  beforeEach(() => {
    collection = factories.collection.build();
    caller = factories.caller.build();
    context = new CollectionCustomizationContext(collection, caller);
  });

  test('context datasource should wrapped', () => {
    expect(context.dataSource).toBeInstanceOf(RelaxedDataSource);
  });

  test('context collection should wrapped', () => {
    expect(context.collection).toBeInstanceOf(RelaxedCollection);
  });

  test('context should keep caller', () => {
    expect(context.caller).toBe(caller);
  });
});
