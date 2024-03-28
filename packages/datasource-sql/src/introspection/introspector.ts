import { Logger } from '@servequery/datasource-toolkit';
import { Dialect, Sequelize } from 'sequelize';

import introspectionDialectFactory from './dialects/dialect-factory';
import IntrospectionDialect, { ColumnDescription } from './dialects/dialect.interface';
import DefaultValueParser from './helpers/default-value-parser';
import SqlTypeConverter from './helpers/sql-type-converter';
import {
  QueryInterfaceExt,
  SequelizeReference,
  SequelizeTableIdentifier,
  SequelizeWithOptions,
} from './type-overrides';
import { Introspection, IntrospectionWithoutSource, Table } from './types';

export default class Introspector {
  static readonly FORMAT_VERSION = 1;
  static readonly SOURCE = '@servequery/datasource-sql';

  static async introspect(sequelize: Sequelize, logger?: Logger): Promise<Introspection> {
    const dialect = introspectionDialectFactory(sequelize.getDialect() as Dialect);

    const tableNames = await this.getTableNames(dialect, sequelize as SequelizeWithOptions);
    const tables = await this.getTables(dialect, tableNames, sequelize, logger);

    this.sanitizeInPlace(tables, logger);

    return { tables, version: this.FORMAT_VERSION, source: this.SOURCE };
  }

  static getIntrospectionInLatestFormat(
    introspection?: Table[] | Introspection | IntrospectionWithoutSource,
  ): Introspection | undefined {
    const formattedIntrospection = this.migrateIntrospectionInLatestFormat(introspection);

    if (formattedIntrospection && formattedIntrospection.source !== this.SOURCE) {
      throw new Error(
        // eslint-disable-next-line max-len
        `This introspection has not been generated by the package @servequery/datasource-sql, but with ${formattedIntrospection.source}.`,
      );
    }

    if (formattedIntrospection && formattedIntrospection.version > this.FORMAT_VERSION) {
      /* This can only occur in CLOUD version, either:
        - servequery-cloud does not have the same version of datasource-sql
          as cloud-agent-manager & servequery-server (We need to fix)
        - datasource-sql should be updated in the local repository
          of the client. He should be prompted to update servequery-cloud.
      */
      throw new Error(
        'This version of introspection is newer than this package version. ' +
        'Please update @servequery/datasource-sql',
      );
    }

    return formattedIntrospection;
  }

  private static migrateIntrospectionInLatestFormat(
    introspection?: Table[] | IntrospectionWithoutSource | Introspection,
  ): Introspection | undefined {
    if (!introspection) {
      return undefined;
    }

    // First version of introspection: just an array of tables
    if (Array.isArray(introspection)) {
      return {
        tables: introspection,
        version: this.FORMAT_VERSION,
        source: this.SOURCE,
      };
    }

    // Second version of introspection: did not include the source,
    // but was always generated by datasource-sql
    if (!Object.prototype.hasOwnProperty.call(introspection, 'source')) {
      return {
        ...introspection,
        source: this.SOURCE,
      };
    }

    return introspection as Introspection;
  }

  /** Get names of all tables in the public schema of the db */
  private static async getTableNames(
    dialect: IntrospectionDialect,
    sequelize: SequelizeWithOptions,
  ): Promise<SequelizeTableIdentifier[]> {
    const tableIdentifiers: ({ tableName: string } | string)[] = await sequelize
      .getQueryInterface()
      .showAllTables();

    const requestedSchema = sequelize.options.schema || dialect.getDefaultSchema(sequelize);

    // Sometimes sequelize returns only strings,
    // and sometimes objects with a tableName and schema property.
    // @see https://github.com/sequelize/sequelize/blob/main/src/dialects/mariadb/query.js#L295
    return (
      tableIdentifiers
        .map((tableIdentifier: string | SequelizeTableIdentifier) =>
          typeof tableIdentifier === 'string'
            ? { tableName: tableIdentifier, schema: requestedSchema }
            : {
              schema: tableIdentifier.schema || requestedSchema,
              tableName: tableIdentifier.tableName,
            },
        )
        // MSSQL returns all tables, not filtered by schema
        .filter(identifier => identifier.schema === requestedSchema)
    );
  }

  private static async getTables(
    dialect: IntrospectionDialect,
    tableNames: SequelizeTableIdentifier[],
    sequelize: Sequelize,
    logger: Logger,
  ): Promise<Table[]> {
    const tablesColumns = await dialect.listColumns(tableNames, sequelize);

    return Promise.all(
      tableNames.map((tableIdentifier, index) => {
        const columnDescriptions = tablesColumns[index];

        return this.getTable(dialect, sequelize, tableIdentifier, columnDescriptions, logger);
      }),
    );
  }

  /** Instrospect a single table */
  private static async getTable(
    dialect: IntrospectionDialect,
    sequelize: Sequelize,
    tableIdentifier: SequelizeTableIdentifier,
    columnDescriptions: ColumnDescription[],
    logger: Logger,
  ): Promise<Table> {
    const queryInterface = sequelize.getQueryInterface() as QueryInterfaceExt;
    // Sequelize is not consistent in the way it handles table identifiers either when it returns
    // it, when it uses it internally, or when it is passed as an argument.
    // Plus it has some bugs with schema handling in postgresql that forces us to be sure that
    // the table identifier is correct on our side
    const tableIdentifierForQuery = dialect.getTableIdentifier(tableIdentifier);

    const [tableIndexes, tableReferences] = await Promise.all([
      queryInterface.showIndex(tableIdentifierForQuery),
      queryInterface.getForeignKeyReferencesForTable(tableIdentifierForQuery),
    ]);

    const references = tableReferences
      .map(tableReference => ({
        ...tableReference,
        tableName:
          typeof tableReference.tableName === 'string'
            ? tableReference.tableName
            : // On SQLite, the query interface returns an object with a tableName property
            tableReference.tableName.tableName,
      }))
      .filter(
        // There is a bug right now with sequelize on postgresql: returned association
        // are not filtered on the schema. So we have to filter them manually.
        // Should be fixed with Sequelize v7
        r => r.tableName === tableIdentifier.tableName && r.tableSchema === tableIdentifier.schema,
      );

    const columns = await Promise.all(
      columnDescriptions.map(async columnDescription => {
        const columnReferences = references.filter(r => r.columnName === columnDescription.name);

        const options = {
          name: columnDescription.name,
          description: columnDescription,
          references: columnReferences,
        };

        return this.getColumn(sequelize, logger, tableIdentifier, options);
      }),
    );

    return {
      name: tableIdentifierForQuery.tableName,
      schema: tableIdentifierForQuery.schema,
      columns: columns.filter(Boolean),
      unique: tableIndexes
        .filter(i => i.unique || i.primary)
        .map(i => i.fields.map(f => f.attribute)),
    };
  }

  private static async getColumn(
    sequelize: Sequelize,
    logger: Logger,
    tableIdentifier: SequelizeTableIdentifier,
    options: {
      name: string;
      description: ColumnDescription;
      references: SequelizeReference[];
    },
  ): Promise<Table['columns'][number]> {
    const { name, description, references } = options;

    try {
      const type = await SqlTypeConverter.convert(tableIdentifier, description);

      return {
        type,
        autoIncrement: description.autoIncrement,
        defaultValue: description.autoIncrement
          ? null
          : DefaultValueParser.parse(description, type),
        isLiteralDefaultValue: description.isLiteralDefaultValue,
        name,
        allowNull: description.allowNull,
        primaryKey: description.primaryKey,
        constraints: references.map(r => ({
          table: r.referencedTableName,
          column: r.referencedColumnName,
        })),
      };
    } catch (e) {
      logger?.('Warn', `Skipping column ${tableIdentifier.tableName}.${name} (${e.message})`);
    }
  }

  /**
   * Remove references to entities that are not present in the schema
   * (happens when we skip entities because of errors)
   */
  private static sanitizeInPlace(tables: Table[], logger?: Logger): void {
    for (const table of tables) {
      // Remove unique indexes which depennd on columns that are not present in the table.
      table.unique = table.unique.filter(unique =>
        unique.every(column => table.columns.find(c => c.name === column)),
      );

      for (const column of table.columns) {
        const references = column.constraints || [];
        // Remove references to tables that are not present in the schema.
        column.constraints = references.filter(constraint => {
          const refTable = tables.find(t => t.name === constraint.table);
          const refColumn = refTable?.columns.find(c => c.name === constraint.column);

          return refTable && refColumn;
        });

        this.logBrokenRelationship(references, column.constraints, table.name, logger);
      }
    }
  }

  private static logBrokenRelationship(
    allConstraints: Table['columns'][number]['constraints'],
    sanitizedConstraints: Table['columns'][number]['constraints'],
    tableName: string,
    logger: Logger,
  ) {
    const missingConstraints = allConstraints.filter(
      constraint => !sanitizedConstraints.includes(constraint),
    );

    missingConstraints.forEach(constraint => {
      logger?.(
        'Error',
        // eslint-disable-next-line max-len
        `Failed to load constraints on relation on table '${tableName}' referencing '${constraint.table}.${constraint.column}'. The relation will be ignored.`,
      );
    });
  }
}
