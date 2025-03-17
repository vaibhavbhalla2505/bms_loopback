import {inject, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {Book} from '../models';

@injectable()
export class CategoryService{
  constructor(
  ){}

  validateGenre(name: string): boolean {
    return /^[a-zA-Z\s]{5,}$/.test(name);
  }
}
