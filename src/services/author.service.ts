import {inject, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {Book} from '../models';

@injectable()
export class AuthorService{
  constructor(
  ){}

  validateName(name: string): boolean {
    return /^[a-zA-Z\s]{3,}$/.test(name);
  }
}
