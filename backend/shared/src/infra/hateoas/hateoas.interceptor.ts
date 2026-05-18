import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { HATEOAS_ITEM_KEY } from './hateoas-item.decorator';
import { HATEOAS_LIST_KEY } from './hateoas-list.decorator';
import {
  HateoasItemOptions,
  HateoasListOptions,
  LinksMap,
  PaginatedResult,
} from './hateoas.types';

@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const itemOptions = this.reflector.get<HateoasItemOptions>(
      HATEOAS_ITEM_KEY,
      context.getHandler(),
    );

    const listOptions = this.reflector.get<HateoasListOptions>(
      HATEOAS_LIST_KEY,
      context.getHandler(),
    );

    if (!itemOptions && !listOptions) {
      return next.handle();
    }

    return next.handle().pipe(
      map((response) => {
        if (!response) return response;

        if (listOptions) {
          return this.transformList(response, listOptions);
        }

        if (itemOptions) {
          return this.transformItem(response, itemOptions);
        }

        return response;
      }),
    );
  }

  private transformItem(item: any, options: HateoasItemOptions): any {
    if (!item) return item;

    const links = this.cleanLinks(options.itemLinks(item));

    return {
      ...item,
      _links: links,
    };
  }

  private transformList(
    result: PaginatedResult<any>,
    options: HateoasListOptions,
  ): any {
    const { data, total, page, limit } = result;
    const totalPages = Math.ceil(total / limit);

    const items = data.map((item: any) => ({
      ...item,
      _links: this.cleanLinks(options.itemLinks(item)),
    }));

    const navLinks: LinksMap = {
      self: { href: `${options.basePath}?_page=${page}&_size=${limit}`, method: 'GET' },
      first: { href: `${options.basePath}?_page=1&_size=${limit}`, method: 'GET' },
      last: {
        href: `${options.basePath}?_page=${totalPages}&_size=${limit}`,
        method: 'GET',
      },
      create: { href: options.basePath, method: 'POST' },
    };

    if (page < totalPages) {
      navLinks.next = {
        href: `${options.basePath}?_page=${page + 1}&_size=${limit}`,
        method: 'GET',
      };
    }

    if (page > 1) {
      navLinks.prev = {
        href: `${options.basePath}?_page=${page - 1}&_size=${limit}`,
        method: 'GET',
      };
    }

    return {
      data: items,
      _links: this.cleanLinks(navLinks),
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  private cleanLinks(links: LinksMap): Record<string, { href: string; method: string }> {
    const cleaned: Record<string, { href: string; method: string }> = {};
    for (const [key, value] of Object.entries(links)) {
      if (value) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}
