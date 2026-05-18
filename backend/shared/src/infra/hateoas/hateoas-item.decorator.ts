import { SetMetadata } from '@nestjs/common';
import { HateoasItemOptions } from './hateoas.types';

export const HATEOAS_ITEM_KEY = 'hateoas:item';

export const HateoasItem = <T>(options: HateoasItemOptions<T>) =>
  SetMetadata(HATEOAS_ITEM_KEY, options);
