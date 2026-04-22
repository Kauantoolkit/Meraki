import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpProxyService {
  private readonly logger = new Logger(HttpProxyService.name);

  constructor(private readonly http: HttpService) {}

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.request<T>(config));
      return response.data;
    } catch (error) {
      if (error.response) {
        // Repassa o erro HTTP do microsserviço downstream
        throw new HttpException(
          error.response.data,
          error.response.status,
        );
      }
      this.logger.error(`Proxy error [${config.method} ${config.url}]: ${error.message}`);
      throw new InternalServerErrorException('Serviço indisponível');
    }
  }

  /** Constrói headers passando o Authorization do usuário autenticado */
  authHeaders(token: string): AxiosRequestConfig {
    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
