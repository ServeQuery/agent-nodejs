import Introspector from '../../src/introspection/introspector';
import { Introspection, Table } from '../../src/introspection/types';

describe('Introspector > Unit', () => {
  describe('getIntrospectionInLatestFormat', () => {
    describe('when the introspection is in the latest format', () => {
      it('should return the introspection', () => {
        const introspection: Introspection = {
          source: '@servequery/datasource-sql',
          version: 1,
          tables: [],
        };

        const result = Introspector.getIntrospectionInLatestFormat(introspection);

        expect(result).toEqual(introspection);
      });
    });

    describe('when the introspection is in the oldest format, with an array of tables', () => {
      it('should return an up-to-date introspection', () => {
        const introspection: Table[] = [
          {
            name: 'books',
            columns: [],
            schema: 'public',
            unique: [],
          },
        ];

        const result = Introspector.getIntrospectionInLatestFormat(introspection);

        expect(result).toEqual({
          source: '@servequery/datasource-sql',
          version: 1,
          tables: introspection,
        });
      });
    });

    it('should return undefined if the introspection is undefined', () => {
      const result = Introspector.getIntrospectionInLatestFormat(undefined);

      expect(result).toBeUndefined();
    });

    describe('source', () => {
      describe('when the introspection does not contain the source', () => {
        it('should add the source and return the introspection', () => {
          const introspection = {
            version: 1,
            tables: [],
          };

          const result = Introspector.getIntrospectionInLatestFormat(introspection);

          expect(result).toEqual({
            source: '@servequery/datasource-sql',
            version: 1,
            tables: [],
          });
        });
      });

      describe('when the source is not the expected one', () => {
        it('should throw an error', () => {
          expect(() => {
            Introspector.getIntrospectionInLatestFormat({
              source: 'another-source',
            } as unknown as Introspection);
          }).toThrow(
            // eslint-disable-next-line max-len
            'This introspection has not been generated by the package @servequery/datasource-sql, but with another-source.',
          );
        });
      });
    });

    describe('version', () => {
      describe('when the version is greater than the latest format version', () => {
        it('should throw an error', () => {
          expect(() => {
            Introspector.getIntrospectionInLatestFormat({
              source: '@servequery/datasource-sql',
              version: 2,
            } as unknown as Introspection);
          }).toThrow(
            // eslint-disable-next-line max-len
            'This version of introspection is newer than this package version. Please update @servequery/datasource-sql',
          );
        });
      });

      describe('when the version is lower than the latest format version', () => {
        it('should return the introspection', () => {
          const introspection: Introspection = {
            source: '@servequery/datasource-sql',
            version: 0,
            tables: [],
          };

          const result = Introspector.getIntrospectionInLatestFormat(introspection);

          expect(result).toEqual(introspection);
        });
      });
    });
  });
});
