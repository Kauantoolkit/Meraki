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
    ThrottlerModule.forRoot([{ ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10) }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
  expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any
},
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
