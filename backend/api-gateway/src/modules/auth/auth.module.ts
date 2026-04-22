import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, HttpProxyService],
})
export class AuthModule {}
