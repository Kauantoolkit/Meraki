import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController, WithdrawalsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController, WithdrawalsController],
  providers: [PaymentsService, HttpProxyService],
})
export class PaymentsModule {}
