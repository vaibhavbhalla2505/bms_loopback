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

export class BookController {
  constructor(
    @repository(BookRepository)
    public bookRepository : BookRepository,
    @repository(AuthorRepository)
    public authorRepository: AuthorRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  validateISBN(isbn: string): boolean {
    return /^\d{13}$/.test(isbn); // Ensures exactly 13 digits
  }
  validateRequiredFields(book: Partial<Book>) {
    const missingFields: string[] = [];
    
    if (!book.title) missingFields.push('title');
    if (!book.publication_date) missingFields.push('publication_date');
    if (book.price === undefined) {
      missingFields.push('price');
    } else if (book.price <= 0) {
      throw new HttpErrors.BadRequest('Invalid price: It must be greater than 0.');
    }
    if (!book.isbn) missingFields.push('isbn');

    if (missingFields.length > 0) {
      throw new HttpErrors.BadRequest(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
  @post('/books', {
    responses: {
      '200': {
        description: 'Book model instance',
        content: {'application/json': {schema: getModelSchemaRef(Book)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {exclude: ['book_id']}),
        },
      },
    })
    book: Omit<Book, 'book_id'>,
  ): Promise<Book> {

    this.validateRequiredFields(book);

    if (!this.validateISBN(book.isbn)) {
      throw new HttpErrors.BadRequest('Invalid ISBN: It must be exactly 13 digits.');
    }

    const authorExists = await this.authorRepository.exists(book.authorId);
    if (!authorExists) {
      throw new HttpErrors.BadRequest(`Author with ID ${book.authorId} does not exist.`);
    }

    const categoryExists = await this.categoryRepository.exists(book.categoryId);
    if (!categoryExists) {
      throw new HttpErrors.BadRequest(`Category with ID ${book.categoryId} does not exist.`);
    }

    const existingBook = await this.bookRepository.findOne({where: {isbn: book.isbn}});
    if (existingBook) {
      throw new HttpErrors.BadRequest(`A book with ISBN ${book.isbn} already exists.`);
    }

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
  async find(
    @param.filter(Book) filter?: Filter<Book>,
  ): Promise<Book[]> {
    return this.bookRepository.find(filter);
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
    return this.bookRepository.findById(id, filter);
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
    this.validateRequiredFields(book);

    if (book.isbn && !this.validateISBN(book.isbn)) {
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
