import {inject,bind,BindingScope} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {Book} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class AuthorService{
  constructor(
  ){}

  validateName(name: string): boolean {
    return /^[a-zA-Z\s]{3,}$/.test(name);
  }
}
