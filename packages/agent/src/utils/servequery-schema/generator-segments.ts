import { Collection, CollectionSchema } from '@servequery/datasource-toolkit';
import { ServeQueryServerSegment } from '@servequery/servequery-client';

export default class SchemaGeneratorSegments {
  static buildSchema(
    collection: Collection,
    name: CollectionSchema['segments'][number],
  ): ServeQueryServerSegment {
    return { id: `${collection.name}.${name}`, name };
  }
}
