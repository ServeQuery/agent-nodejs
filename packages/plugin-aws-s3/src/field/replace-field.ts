import type { Configuration } from '../types';
import type { CollectionCustomizer } from '@servequery/datasource-customizer';

export default function replaceField(
  collection: CollectionCustomizer,
  config: Configuration,
): void {
  collection.removeField(config.sourcename);
  collection.renameField(config.filename, config.sourcename);
}
