import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors
} from '@loopback/rest';
import {Book} from '../models';
import {BookRepository,AuthorRepository,CategoryRepository} from '../repositories';
import { service } from '@loopback/core';
import { BookService } from '../services/book.service';
type BookWithRelations = Book & {
  author?: { name: string };
  category?: { genre: string };
};

export class BookController {
  constructor(
    @repository(BookRepository)
    public bookRepository : BookRepository,

    @service(BookService)
    public bookService: BookService,
  ) {}

  @post('/books')
  @response(200, {
    description: 'Book model instance',
    content: {'application/json': {schema: getModelSchemaRef(Book)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {
            title: 'NewBook',
            exclude: ['id'],
          }),
        },
      },
    })
    book: Omit<Book, 'id'>,
  ): Promise<Book> {
    this.bookService.validateRequiredFields(book);
    await this.bookService.validateBookConstraints(book);

    return this.bookRepository.create(book);
  }

  @get('/books/count')
  @response(200, {
    description: 'Book model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Book) where?: Where<Book>,
  ): Promise<Count> {
    return this.bookRepository.count(where);
  }

  @get('/books')
  @response(200, {
    description: 'Array of Book model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Book, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Book) filter?: Filter<Book>): Promise<any[]> {
    const books: BookWithRelations[] = await this.bookRepository.find({
      ...filter,
      include: [
        {
          relation: 'author',
          scope: {
            fields: { name: true },
          },
        },
        {
          relation: 'category',
          scope: {
            fields: { genre: true },
          },
        },
      ],
    });
  
    return books.map(book => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      publication_date: book.date,
      price: book.price,
      author: book.author?.name,
      genre: book.category?.genre,
    }));
  }

  @patch('/books')
  @response(200, {
    description: 'Book PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Book,
    @param.where(Book) where?: Where<Book>,
  ): Promise<Count> {
    return this.bookRepository.updateAll(book, where);
  }

  @get('/books/{id}')
  @response(200, {
    description: 'Book model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Book, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Book, {exclude: 'where'}) filter?: FilterExcludingWhere<Book>
  ): Promise<Book> {
    return this.bookRepository.findById(id,{
      ...filter,
      include:[
        {
          relation: 'author',
          scope: {
            fields: ['name']
          }
        },
        {
          relation: 'category',
          scope: {
            fields: ['genre']
          }
        }
      ]
    });
  }

  @patch('/books/{id}')
  @response(204, {
    description: 'Book PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Book,
  ): Promise<void> {
    this.bookService.validateRequiredFields(book);

    if (book.isbn && !this.bookService.validateISBN(book.isbn)) {
      throw new HttpErrors.BadRequest('Invalid ISBN: It must be exactly 13 digits.');
    }
    await this.bookRepository.updateById(id, book);
  }

  @put('/books/{id}')
  @response(204, {
    description: 'Book PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() book: Book,
  ): Promise<void> {
    await this.bookRepository.replaceById(id, book);
  }

  @del('/books/{id}')
  @response(204, {
    description: 'Book DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bookRepository.deleteById(id);
  }
}
