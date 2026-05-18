import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { IdentityModule } from './identity.module';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    SharedModule,
    IdentityModule,
  ],
})
export class AppModule {}
