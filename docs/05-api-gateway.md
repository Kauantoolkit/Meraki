# MERAKI - API Gateway (Anti-Corruption Layer)

## 1. Visão Geral do API Gateway (DDD)

O API Gateway funciona como um **Anti-Corruption Layer (ACL)** entre os clientes (Flutter Mobile App) e os Bounded Contexts do backend.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   API GATEWAY - ANTI-CORRUPTION LAYER                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   FLUTTER MOBILE APP                                 │   │
│  │              (não precisa conhecer os Contexts)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ Unified API                          │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     API GATEWAY / ACL                                │   │
│  │                                                                       │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │   │   Auth      │  │  Rate       │  │   Request   │               │   │
│  │   │   Handler   │  │  Limiter    │  │  Validator  │               │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  │                                                                       │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │   │    JWT      │  │   ACL       │  │    DTO      │               │   │
│  │   │   Guard     │  │  Transform │  │  Mapping    │               │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  │                                                                       │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │                     ROUTING LAYER                              │   │   │
│  │   │  (Traduz requisições para os Bounded Contexts corretos)      │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                    ┌─────────────────┼─────────────────┐                   │
│                    │                 │                 │                   │
                    ▼                 ▼                 ▼
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │   User Service    │ │ Project Service  │ │ Bidding Service  │
        │    (Port 3001)    │ │   (Port 3002)    │ │   (Port 3003)    │
        └───────────────────┘ └───────────────────┘ └───────────────────┘
                    │                                         │
                    └─────────────────┼───────────────────────┘
                                      ▼
        ┌───────────────────┐ ┌───────────────────┐
        │ Delivery Service  │ │  Payment Service  │
        │    (Port 3004)    │ │    (Port 3005)    │
        └───────────────────┘ └───────────────────┘
```

---

## 2. Estrutura do Projeto

```
api-gateway/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   └── env.validation.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   └── projects.module.ts
│   │   │
│   │   ├── bids/
│   │   │   ├── bids.controller.ts
│   │   │   ├── bids.service.ts
│   │   │   └── bids.module.ts
│   │   │
│   │   ├── milestones/
│   │   │   ├── milestones.controller.ts
│   │   │   ├── milestones.service.ts
│   │   │   └── milestones.module.ts
│   │   │
│   │   └── payments/
│   │       ├── payments.controller.ts
│   │       ├── payments.service.ts
│   │       └── payments.module.ts
│   │
│   └── proxy/
│       └── microservice-proxy.service.ts
│
├── test/
├── Dockerfile
├── docker-compose.yml
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 3. Configuração Principal

### 3.1 Package.json

```json
{
  "name": "@meraki/api-gateway",
  "version": "1.0.0",
  "description": "API Gateway for MERAKI",
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
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/throttler": "^5.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/passport-jwt": "^3.0.9",
    "typescript": "^5.1.3"
  }
}
```

### 3.2 Main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MERAKI API')
    .setDescription('MERAKI Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // CORS
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}

bootstrap();
```

### 3.3 App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BidsModule } from './modules/bids/bids.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    ProjectsModule,
    BidsModule,
    MilestonesModule,
    PaymentsModule,
    PortfolioModule,
  ],
})
export class AppModule {}
```

---

## 4. Guards e Decorators

### 4.1 JWT Auth Guard

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### 4.2 Roles Guard

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.userType === role);
  }
}
```

### 4.3 Current User Decorator

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return data ? user?.[data] : user;
  },
);
```

### 4.4 Roles Decorator

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## 5. Módulos de Routing

### 5.1 Auth Controller (Rotas de Autenticação)

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
```

### 5.2 Projects Controller

```typescript
// src/modules/projects/projects.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  async findAll(@Query() query: { status?: string; page?: number; limit?: number }) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Update project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Cancel project' })
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/assign')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Assign specialist to project' })
  async assignSpecialist(@Param('id') projectId: string, @Body() body: { bidId: string }) {
    return this.projectsService.assignSpecialist(projectId, body.bidId);
  }
}
```

### 5.3 Bids Controller

```typescript
// src/modules/bids/bids.controller.ts
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBidDto } from './dto/create-bid.dto';

@ApiTags('Bids')
@Controller('projects/:projectId/bids')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Submit a bid' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateBidDto,
    @CurrentUser('id') specialistId: string,
  ) {
    return this.bidsService.create(projectId, dto, specialistId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids for a project' })
  async findAll(@Param('projectId') projectId: string) {
    return this.bidsService.findByProject(projectId);
  }

  @Get('my-bids')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Get my bids' })
  async getMyBids(@CurrentUser('id') specialistId: string) {
    return this.bidsService.findBySpecialist(specialistId);
  }

  @Put(':id/accept')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Accept a bid' })
  async accept(@Param('id') bidId: string) {
    return this.bidsService.accept(bidId);
  }

  @Put(':id/reject')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Reject a bid' })
  async reject(@Param('id') bidId: string) {
    return this.bidsService.reject(bidId);
  }
}
```

### 5.4 Milestones Controller

```typescript
// src/modules/milestones/milestones.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMilestoneDto } from './dto/create-milestone.dto';

@ApiTags('Milestones')
@Controller('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Create a milestone' })
  async create(@Body() dto: CreateMilestoneDto) {
    return this.milestonesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get milestone by ID' })
  async findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get milestones by project' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.milestonesService.findByProject(projectId);
  }

  @Put(':id/start')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Start milestone' })
  async start(@Param('id') id: string) {
    return this.milestonesService.start(id);
  }

  @Put(':id/submit')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Submit milestone delivery' })
  async submit(@Param('id') id: string, @Body() body: { notes: string; files: string[] }) {
    return this.milestonesService.submit(id, body);
  }

  @Put(':id/approve')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Approve milestone' })
  async approve(@Param('id') id: string) {
    return this.milestonesService.approve(id);
  }

  @Put(':id/reject')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Reject milestone' })
  async reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.milestonesService.reject(id, body.reason);
  }
}
```

### 5.5 Payments Controller

```typescript
// src/modules/payments/payments.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('escrow')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Create escrow for milestone' })
  async createEscrow(@Body() body: { milestoneId: string; amount: number }) {
    return this.paymentsService.createEscrow(body.milestoneId, body.amount);
  }

  @Post('release')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Release payment for milestone' })
  async releasePayment(@Body() body: { milestoneId: string }) {
    return this.paymentsService.releasePayment(body.milestoneId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get payments by project' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.paymentsService.findByProject(projectId);
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'Get payment by milestone' })
  async findByMilestone(@Param('milestoneId') milestoneId: string) {
    return this.paymentsService.findByMilestone(milestoneId);
  }
}
```

### 5.6 Portfolio Controller

```typescript
// src/modules/portfolio/portfolio.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Get specialist portfolio' })
  async getPortfolio(@Param('specialistId') specialistId: string) {
    return this.portfolioService.getPortfolioBySpecialist(specialistId);
  }

  @Post()
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Create portfolio item' })
  async create(@Body() body: any, @CurrentUser('id') specialistId: string) {
    return this.portfolioService.createPortfolio({ ...body, specialistId });
  }

  @Put(':id')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Update portfolio item' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.portfolioService.updatePortfolio(id, body);
  }

  @Delete(':id')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Delete portfolio item' })
  async delete(@Param('id') id: string) {
    return this.portfolioService.deletePortfolio(id);
  }

  @Get('specialist/:specialistId/certifications')
  @ApiOperation({ summary: 'Get specialist certifications' })
  async getCertifications(@Param('specialistId') specialistId: string) {
    return this.portfolioService.getCertifications(specialistId);
  }

  @Post('certification')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Add certification' })
  async addCertification(@Body() body: any, @CurrentUser('id') specialistId: string) {
    return this.portfolioService.addCertification({ ...body, specialistId });
  }

  @Get('specialist/:specialistId/reviews')
  @ApiOperation({ summary: 'Get specialist reviews' })
  async getReviews(@Param('specialistId') specialistId: string) {
    return this.portfolioService.getReviews(specialistId);
  }

  @Post('review')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Submit review' })
  async submitReview(@Body() body: any) {
    return this.portfolioService.submitReview(body);
  }

  @Get('profile/:specialistId')
  @ApiOperation({ summary: 'Get public specialist profile (RF12)' })
  async getPublicProfile(@Param('specialistId') specialistId: string) {
    return this.portfolioService.getPublicProfile(specialistId);
  }

  @Get('history/:specialistId')
  @ApiOperation({ summary: 'Get specialist work history (RF11, RF14)' })
  async getHistory(@Param('specialistId') specialistId: string) {
    return this.portfolioService.getWorkHistory(specialistId);
  }
}
```

---

## 6. Serviço de Proxy (Comunicação entre Microsserviços)

```typescript
// src/proxy/microservice-proxy.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MicroserviceProxyService {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    @Inject('BIDDING_SERVICE') private biddingClient: ClientProxy,
    @Inject('DELIVERY_SERVICE') private deliveryClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
  ) {}

  // User (Identity & Access)
  sendToUser(pattern: string, data: any) {
    return this.userClient.send(pattern, data);
  }

  // Project
  sendToProject(pattern: string, data: any) {
    return this.projectClient.send(pattern, data);
  }

  // Bidding
  sendToBidding(pattern: string, data: any) {
    return this.biddingClient.send(pattern, data);
  }

  // Delivery
  sendToDelivery(pattern: string, data: any) {
    return this.deliveryClient.send(pattern, data);
  }

  // Payment
  sendToPayment(pattern: string, data: any) {
    return this.paymentClient.send(pattern, data);
  }
}
```

---

## 7. Documentação da API (Swagger)

### Endpoints Disponíveis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Registrar usuário | No |
| POST | /api/auth/login | Autenticar | No |
| POST | /api/projects | Criar projeto | Yes (Company) |
| GET | /api/projects | Listar projetos | Yes |
| GET | /api/projects/:id | Detalhes do projeto | Yes |
| PUT | /api/projects/:id | Atualizar projeto | Yes (Company) |
| DELETE | /api/projects/:id | Cancelar projeto | Yes (Company) |
| POST | /api/projects/:id/bids | Submeter proposta | Yes (Specialist) |
| GET | /api/projects/:id/bids | Listar propostas | Yes |
| PUT | /api/bids/:id/accept | Aceitar proposta | Yes (Company) |
| PUT | /api/bids/:id/reject | Rejeitar proposta | Yes (Company) |
| POST | /api/milestones | Criar marco | Yes (Company) |
| GET | /api/milestones/:id | Detalhes do marco | Yes |
| PUT | /api/milestones/:id/start | Iniciar marco | Yes (Specialist) |
| PUT | /api/milestones/:id/submit | Submeter entrega | Yes (Specialist) |
| PUT | /api/milestones/:id/approve | Aprovar marco | Yes (Company) |
| POST | /api/payments/escrow | Criar bloqueio | Yes (Company) |
| POST | /api/payments/release | Liberar pagamento | Yes (Company) |

---

## 8. Docker Compose

```yaml
# docker-compose.yml - API Gateway
version: '3.8'

services:
  api-gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - JWT_SECRET=meraki-jwt-secret
      - USER_SERVICE_HOST=user-service
      - USER_SERVICE_PORT=3001
      - PROJECT_SERVICE_HOST=project-service
      - PROJECT_SERVICE_PORT=3002
      - BIDDING_SERVICE_HOST=bidding-service
      - BIDDING_SERVICE_PORT=3003
      - DELIVERY_SERVICE_HOST=delivery-service
      - DELIVERY_SERVICE_PORT=3004
      - PAYMENT_SERVICE_HOST=payment-service
      - PAYMENT_SERVICE_PORT=3005
    depends_on:
      - user-service
      - project-service
      - bidding-service
      - delivery-service
      - payment-service
```

---

## 9. Próximos Passos

- [ ] 06 - Arquitetura Flutter MVVM
- [ ] 07 - Implementação Flutter/Dart

