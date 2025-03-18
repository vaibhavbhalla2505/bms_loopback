import {inject, bind,BindingScope} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {Book} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class CategoryService{
  constructor(
  ){}

  validateGenre(name: string): boolean {
    return /^[a-zA-Z\s]{5,}$/.test(name);
  }
}
