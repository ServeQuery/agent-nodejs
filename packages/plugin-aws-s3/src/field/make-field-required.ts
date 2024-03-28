import type { Configuration } from '../types';
import type { CollectionCustomizer } from '@servequery/datasource-customizer';
import type { ColumnSchema } from '@servequery/datasource-toolkit';

export default function makeFieldRequired(
  collection: CollectionCustomizer,
  config: Configuration,
): void {
  const schema = collection.schema.fields[config.sourcename] as ColumnSchema;

  if (schema.validation?.find(rule => rule.operator === 'Present')) {
    collection.addFieldValidation(config.filename, 'Present');
  }
}
