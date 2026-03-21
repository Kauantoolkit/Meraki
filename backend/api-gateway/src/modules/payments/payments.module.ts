import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, HttpProxyService],
})
export class PaymentsModule {}
