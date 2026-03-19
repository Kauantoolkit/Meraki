# MERAKI - Implementação Backend NestJS (DDD)

## 1. Camadas DDD em um Microsserviço

Cada microsserviço seguirá a estrutura DDD com as seguintes camadas:

```
src/
├── domain/                    # Camada de Domínio (CORE)
│   ├── entities/            # Entidades / Aggregate Roots
│   │   └── user.entity.ts
│   ├── value-objects/      # Objetos de valor
│   │   └── email.value-object.ts
│   ├── repositories/       # Interfaces de repositório (abstrações)
│   │   └── user.repository.interface.ts
│   ├── domain-services/    # Domain Services (lógica de negócio complexa)
│   │   └── user-domain.service.ts
│   └── events/             # Domain Events (eventos internos)
│       └── user-registered.event.ts
│
├── application/             # Camada de Aplicação
│   ├── use-cases/          # Application Services / Use Cases
│   │   └── register-user.use-case.ts
│   ├── services/           # Serviços de aplicação
│   │   └── auth.service.ts
│   └── dto/               # Data Transfer Objects
│       ├── create-user.dto.ts
│       └── user-response.dto.ts
│
├── infrastructure/          # Camada de Infraestrutura
│   ├── database/           # Configuração do banco
│   │   └── typeorm.config.ts
│   ├── rabbitmq/          # Configuração RabbitMQ
│   │   └── rabbitmq.module.ts
│   └── repositories/       # Implementações de repositório
│       └── user.repository.ts
│
└── interfaces/             # Camada de Interfaces (adaptadores)
    ├── controllers/       # Controladores REST
    │   └── user.controller.ts
    ├── rest/              # Configurações REST
    │   └── swagger.config.ts
    └── filters/           # Filtros de exceção
        └── http-exception.filter.ts
```

### Diferença entre Domain Service e Application Service

| Aspecto | Domain Service | Application Service |
|---------|---------------|---------------------|
| **Camada** | Domain | Application |
| **Responsabilidade** | Lógica de negócio que não pertence a uma Entity | Orquestração de use cases |
| **Exemplo** | Calcular rating médio de especialista | Criar usuário (orchestrates) |
| **Estado** | Pode ter estado | Geralmente stateless |

---

## 2. Configuração Inicial do Projeto

### 2.1 Package.json Base (user-service)

```json
{
  "name": "@meraki/user-service",
  "version": "1.0.0",
  "description": "User Service (Identity & Access) for MERAKI",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "amqplib": "^0.10.3",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0",
    "rxjs": "^7.8.1",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/bcrypt": "^5.0.0",
    "@types/amqplib": "^0.10.1",
    "@types/uuid": "^9.0.0",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

---

## 3. User Service (Identity & Access) - Implementação Completa

### 3.1 Domain Layer

#### Entity: User

```typescript
// src/domain/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { UserType } from '../enums/user-type.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Value Object: Email

```typescript
// src/domain/value-objects/email.value-object.ts
export class Email {
  private readonly email: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.email = email;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this.email;
  }
}
```

#### Repository Interface

```typescript
// src/domain/repositories/user.repository.interface.ts
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../../application/dto/create-user.dto';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

---

### 3.2 Application Layer

#### DTOs

```typescript
// src/application/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserType } from '../../domain/enums/user-type.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserType)
  userType: UserType;
}
```

```typescript
// src/application/dto/user-response.dto.ts
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  userType: string;
  createdAt: Date;
}
```

#### Use Case: Register User

```typescript
// src/application/use-cases/register-user.use-case.ts
import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    const user = await this.userRepository.create({
      ...dto,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      createdAt: user.createdAt,
    };
  }
}
```

#### Use Case: Authenticate

```typescript
// src/application/use-cases/authenticate.use-case.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticateUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, userType: user.userType };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    };
  }
}
```

---

### 3.3 Infrastructure Layer

#### TypeORM Configuration

```typescript
// src/infrastructure/database/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'identity_db',
  entities: [User],
  synchronize: true, // Only for development
  logging: process.env.NODE_ENV === 'development',
};
```

#### Repository Implementation

```typescript
// src/infrastructure/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../../application/dto/create-user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto & { passwordHash: string }): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

---

### 3.4 Interfaces Layer

#### Controller

```typescript
// src/interfaces/controllers/user.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from '../../application/use-cases/authenticate.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUseCase: AuthenticateUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authenticateUseCase.execute(body.email, body.password);
  }
}
```

---

### 3.5 Módulo Principal

```typescript
// src/identity.service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';
import { UserController } from './interfaces/controllers/user.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from './application/use-cases/authenticate.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'meraki-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    RegisterUserUseCase,
    AuthenticateUseCase,
  ],
})
export class IdentityServiceModule {}
```

---

## 4. Estrutura Similar para Outros Serviços

### Project Service - Domain Entities

```typescript
// src/domain/entities/project.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProjectStatus } from '../enums/project-status.enum';
import { User } from './user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  requirements: string[];

  @Column('decimal')
  budget: number;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @Column({ nullable: true })
  specialistId: string;

  @Column({ nullable: true })
  bidId: string;

  @Column()
  companyId: string;

  @ManyToOne(() => User)
  company: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 5. Configuração Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Databases
  identity-db:
    image: postgres:15
    environment:
      POSTGRES_DB: identity_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - identity-db:/var/lib/postgresql/data

  project-db:
    image: postgres:15
    environment:
      POSTGRES_DB: project_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - project-db:/var/lib/postgresql/data

  bidding-db:
    image: postgres:15
    environment:
      POSTGRES_DB: bidding_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    volumes:
      - bidding-db:/var/lib/postgresql/data

  delivery-db:
    image: postgres:15
    environment:
      POSTGRES_DB: delivery_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"
    volumes:
      - delivery-db:/var/lib/postgresql/data

  payment-db:
    image: postgres:15
    environment:
      POSTGRES_DB: payment_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5436:5432"
    volumes:
      - payment-db:/var/lib/postgresql/data

  # Portfolio Database
  portfolio-db:
    image: postgres:15
    environment:
      POSTGRES_DB: portfolio_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5437:5432"
    volumes:
      - portfolio-db:/var/lib/postgresql/data

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: meraki
      RABBITMQ_DEFAULT_PASS: meraki
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq:/var/lib/rabbitmq

volumes:
  identity-db:
  project-db:
  bidding-db:
  delivery-db:
  payment-db:
  portfolio-db:
  rabbitmq:
```

---

## 6. Script de Criação de Serviços

```bash
#!/bin/bash

# Criar estrutura base para cada microsserviço
SERVICES=("identity-service" "project-service" "bidding-service" "delivery-service" "payment-service" "portfolio-service" "api-gateway")

for service in "${SERVICES[@]}"; do
  mkdir -p "$service/src/domain/entities"
  mkdir -p "$service/src/domain/value-objects"
  mkdir -p "$service/src/domain/repositories"
  mkdir -p "$service/src/domain/events"
  mkdir -p "$service/src/application/use-cases"
  mkdir -p "$service/src/application/services"
  mkdir -p "$service/src/application/dto"
  mkdir -p "$service/src/infrastructure/database"
  mkdir -p "$service/src/infrastructure/rabbitmq"
  mkdir -p "$service/src/infrastructure/repositories"
  mkdir -p "$service/src/interfaces/controllers"
  mkdir -p "$service/src/interfaces/rest"
  mkdir -p "$service/src/interfaces/filters"
  
  echo "Created structure for $service"
done
```

---

## 7. Próximos Passos

- [ ] 04 - Configuração RabbitMQ
- [ ] 05 - API Gateway
- [ ] 06 - Arquitetura Flutter MVVM
- [ ] 07 - Implementação Flutter

