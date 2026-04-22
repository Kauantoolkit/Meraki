import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from './identity.module';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    IdentityModule,
  ],
})
export class AppModule {}
