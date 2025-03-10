import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {BmsDataSource} from '../datasources';
import {Author, AuthorRelations, Book} from '../models';
import {BookRepository} from './book.repository';

export class AuthorRepository extends DefaultCrudRepository<
  Author,
  typeof Author.prototype.author_id,
  AuthorRelations
> {

  public readonly authorID: HasManyRepositoryFactory<Book, typeof Author.prototype.author_id>;

  constructor(
    @inject('datasources.bms') dataSource: BmsDataSource, @repository.getter('BookRepository') protected bookRepositoryGetter: Getter<BookRepository>,
  ) {
    super(Author, dataSource);
    this.authorID = this.createHasManyRepositoryFactoryFor('authorID', bookRepositoryGetter,);
    this.registerInclusionResolver('authorID', this.authorID.inclusionResolver);
  }
}
