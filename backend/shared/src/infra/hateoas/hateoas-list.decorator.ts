import { SetMetadata } from '@nestjs/common';
import { HateoasListOptions } from './hateoas.types';

export const HATEOAS_LIST_KEY = 'hateoas:list';

export const HateoasList = <T>(options: HateoasListOptions<T>) =>
  SetMetadata(HATEOAS_LIST_KEY, options);
