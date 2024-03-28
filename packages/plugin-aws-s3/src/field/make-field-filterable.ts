import type { Configuration } from '../types';
import type { CollectionCustomizer } from '@servequery/datasource-customizer';
import type { ColumnSchema } from '@servequery/datasource-toolkit';

export default function makeFieldFilterable(
  collection: CollectionCustomizer,
  config: Configuration,
): void {
  const schema = collection.schema.fields[config.sourcename] as ColumnSchema;

  for (const operator of schema.filterOperators) {
    collection.replaceFieldOperator(config.filename, operator, value => ({
      field: config.sourcename,
      operator, // @fixme not sure this works, we should use intermediary variable
      value,
    }));
  }
}
