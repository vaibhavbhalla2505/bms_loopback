import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {BmsDataSource} from '../datasources';
import {Category, CategoryRelations, Book} from '../models';
import {BookRepository} from './book.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly categoryId: HasManyRepositoryFactory<Book, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.bms') dataSource: BmsDataSource, @repository.getter('BookRepository') protected bookRepositoryGetter: Getter<BookRepository>,
  ) {
    super(Category, dataSource);
    this.categoryId = this.createHasManyRepositoryFactoryFor('categoryId', bookRepositoryGetter,);
    this.registerInclusionResolver('categoryId', this.categoryId.inclusionResolver);
  }
}
