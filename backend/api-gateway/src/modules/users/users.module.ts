import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [UsersController],
  providers: [UsersService, HttpProxyService],
})
export class UsersModule {}
