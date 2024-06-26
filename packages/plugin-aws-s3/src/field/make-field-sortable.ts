import type { Configuration } from '../types';
import type { CollectionCustomizer } from '@servequery/datasource-customizer';

export default function makeFieldSortable(
  collection: CollectionCustomizer,
  config: Configuration,
): void {
  collection.replaceFieldSorting(config.filename, [{ ascending: true, field: config.sourcename }]);
}
