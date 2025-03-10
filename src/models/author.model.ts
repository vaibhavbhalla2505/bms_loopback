import {Entity, model, property, hasMany} from '@loopback/repository';
import {Book} from './book.model';

@model()
export class Author extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  author_id?: number;

  @property({
    type: 'string',
    required: true,
  })
  author_name: string;

  @hasMany(() => Book)
  authorID: Book[];

  constructor(data?: Partial<Author>) {
    super(data);
  }
}

export interface AuthorRelations {
  // describe navigational properties here
}

export type AuthorWithRelations = Author & AuthorRelations;
