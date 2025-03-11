import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BmsDataSource} from '../datasources';
import {Book, BookRelations, Author, Category} from '../models';
import {AuthorRepository} from './author.repository';
import {CategoryRepository} from './category.repository';

export class BookRepository extends DefaultCrudRepository<
  Book,
  typeof Book.prototype.id,
  BookRelations
> {

  public readonly author: BelongsToAccessor<Author, typeof Book.prototype.id>;

  public readonly category: BelongsToAccessor<Category, typeof Book.prototype.id>;

  constructor(
    @inject('datasources.bms') dataSource: BmsDataSource, @repository.getter('AuthorRepository') protected authorRepositoryGetter: Getter<AuthorRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Book, dataSource);
    this.category = this.createBelongsToAccessorFor('category', categoryRepositoryGetter,);
    this.registerInclusionResolver('category', this.category.inclusionResolver);
    this.author = this.createBelongsToAccessorFor('author', authorRepositoryGetter,);
    this.registerInclusionResolver('author', this.author.inclusionResolver);
  }
}
