import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {BmsDataSource} from '../datasources';
import {Author, AuthorRelations, Book} from '../models';
import {BookRepository} from './book.repository';

export class AuthorRepository extends DefaultCrudRepository<
  Author,
  typeof Author.prototype.id,
  AuthorRelations
> {

  public readonly authorId: HasManyRepositoryFactory<Book, typeof Author.prototype.id>;

  constructor(
    @inject('datasources.bms') dataSource: BmsDataSource, @repository.getter('BookRepository') protected bookRepositoryGetter: Getter<BookRepository>,
  ) {
    super(Author, dataSource);
    this.authorId = this.createHasManyRepositoryFactoryFor('authorId', bookRepositoryGetter,);
    this.registerInclusionResolver('authorId', this.authorId.inclusionResolver);
  }
}
