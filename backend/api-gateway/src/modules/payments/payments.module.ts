import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController, PaymentHiringGatewayController, WebhooksGatewayController, WithdrawalsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController, PaymentHiringGatewayController, WebhooksGatewayController, WithdrawalsController],
  providers: [PaymentsService, HttpProxyService],
})
export class PaymentsModule {}
