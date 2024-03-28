import createServeQueryClient from '../src';
import ServeQueryClient from '../src/servequery-admin-client-with-cache';

describe('ServeQueryClient index', () => {
  describe('without specifying optional parameters', () => {
    it('should create a new client with the right dependencies', () => {
      const created = createServeQueryClient({
        envSecret: 'SECRET',
      });

      expect(created).toBeInstanceOf(ServeQueryClient);
    });
  });
});
