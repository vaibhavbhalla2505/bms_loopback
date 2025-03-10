import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Author} from './author.model';
import {Category} from './category.model';

@model()
export class Book extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  book_id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  isbn: string;

  @property({
    type: 'date',
    required: true,
  })
  publication_date: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @belongsTo(() => Author)
  authorId: number;

  @belongsTo(() => Category)
  categoryId: number;

  constructor(data?: Partial<Book>) {
    super(data);
  }
}

export interface BookRelations {
  // describe navigational properties here
}

export type BookWithRelations = Book & BookRelations;
