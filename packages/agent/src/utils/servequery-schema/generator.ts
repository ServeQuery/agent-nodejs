import { DataSource } from '@servequery/datasource-toolkit';
import { ServeQuery } from '@servequery/servequery-client';

import SchemaGeneratorCollection from './generator-collection';

export default class SchemaGenerator {
  static async buildSchema(dataSource: DataSource): Promise<Pick<ServeQuery, 'collections'>> {
    return {
      collections: await Promise.all(
        [...dataSource.collections]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(c => SchemaGeneratorCollection.buildSchema(c)),
      ),
    };
  }

  static buildMetadata(features: Record<string, string> | null): Pick<ServeQuery, 'meta'> {
    const { version } = require('../../../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires,global-require,max-len

    return {
      meta: {
        liana: 'servequery-nodejs-agent',
        liana_version: version,
        liana_features: features,
        stack: {
          engine: 'nodejs',
          engine_version: process.versions && process.versions.node,
        },
      },
    };
  }
}
