import {inject,bind,BindingScope} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {BookRepository, AuthorRepository, CategoryRepository} from '../repositories';
import {Book} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class BookService {
  constructor(
    @inject('repositories.BookRepository')
    public bookRepository: BookRepository,
    @inject('repositories.AuthorRepository')
    public authorRepository: AuthorRepository,
    @inject('repositories.CategoryRepository')
    public categoryRepository: CategoryRepository
  ) {}

  validateISBN(isbn: string): boolean {
    return /^\d{13}$/.test(isbn);
  }

  validateRequiredFields(book: Partial<Book>) {
    const missingFields: string[] = [];

    if (!book.title) missingFields.push('title');
    if (!book.date) missingFields.push('publication_date');
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

  async validateBookConstraints(book: Omit<Book, 'id'>) {
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
  }
}
