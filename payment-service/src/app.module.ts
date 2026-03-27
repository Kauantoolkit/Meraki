import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentModule } from './payment.module';
import { Payment } from './domain/entities/payment.entity';
import { Withdrawal } from './domain/entities/withdrawal.entity';
import { SpecialistBalance } from './domain/entities/specialist-balance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DB config read by Nest:',
          config.get('DB_HOST', 'localhost'),
          config.get('DB_PORT', '5434'),
          config.get('DB_USERNAME', 'postgres'),
          config.get('DB_PASSWORD', 'postgres'),
          config.get('DB_NAME', 'meraki_payment'),
        );

        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: parseInt(config.get('DB_PORT', '5434'), 10),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_NAME', 'meraki_payment'),
          entities: [Payment, Withdrawal, SpecialistBalance],
          synchronize: config.get('NODE_ENV') === 'development',
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),
    PaymentModule,
  ],
})
export class AppModule {}
