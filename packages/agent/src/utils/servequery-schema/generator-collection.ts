import { Collection, SchemaUtils } from '@servequery/datasource-toolkit';
import {
  ServeQueryServerAction,
  ServeQueryServerCollection,
  ServeQueryServerField,
  ServeQueryServerSegment,
} from '@servequery/servequery-client';

import SchemaGeneratorActions from './generator-actions';
import SchemaGeneratorFields from './generator-fields';
import SchemaGeneratorSegments from './generator-segments';

export default class SchemaGeneratorCollection {
  /** Build servequery-server schema for a collection */
  static async buildSchema(collection: Collection): Promise<ServeQueryServerCollection> {
    return {
      actions: await this.buildActions(collection),
      fields: this.buildFields(collection),
      icon: null,
      integration: null,
      isReadOnly: Object.values(collection.schema.fields).every(
        field => field.type !== 'Column' || field.isReadOnly,
      ),
      isSearchable: collection.schema.searchable,
      isVirtual: false,
      name: collection.name,
      onlyForRelationships: false,
      paginationType: 'page',
      segments: this.buildSegments(collection),
    };
  }

  private static buildActions(collection: Collection): Promise<ServeQueryServerAction[]> {
    return Promise.all(
      Object.keys(collection.schema.actions)
        .sort()
        .map(name => SchemaGeneratorActions.buildSchema(collection, name)),
    );
  }

  private static buildFields(collection: Collection): ServeQueryServerField[] {
    // Do not export foreign keys as those will be edited using the many to one relationship.
    // Note that we always keep primary keys as not having them breaks reference fields in the UI.
    return Object.keys(collection.schema.fields)
      .filter(
        name =>
          SchemaUtils.isPrimaryKey(collection.schema, name) ||
          !SchemaUtils.isForeignKey(collection.schema, name),
      )
      .sort()
      .map(name => SchemaGeneratorFields.buildSchema(collection, name));
  }

  private static buildSegments(collection: Collection): ServeQueryServerSegment[] {
    return collection.schema.segments
      .sort()
      .map(name => SchemaGeneratorSegments.buildSchema(collection, name));
  }
}
