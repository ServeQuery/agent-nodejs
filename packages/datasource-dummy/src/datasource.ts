import { BaseDataSource } from '@servequery/datasource-toolkit';

import BooksCollection from './collections/books';
import LibrariesCollection from './collections/libraries';
import LibrariesBooksCollection from './collections/libraries-books';
import PersonsCollection from './collections/persons';

export default class DummyDataSource extends BaseDataSource {
  constructor() {
    super();

    this.addCollection(new BooksCollection(this));
    this.addCollection(new PersonsCollection(this));
    this.addCollection(new LibrariesCollection(this));
    this.addCollection(new LibrariesBooksCollection(this));
  }
}
