import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BidsModule } from './modules/bids/bids.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'meraki-jwt-secret',
      signOptions: { expiresIn: '7d' },
    }),
    HttpModule.register({ timeout: 10000 }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    BidsModule,
    MilestonesModule,
    PaymentsModule,
    PortfolioModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
