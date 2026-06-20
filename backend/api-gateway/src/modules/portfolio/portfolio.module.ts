import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PortfolioController, ReviewsController, CertificationsController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [PortfolioController, ReviewsController, CertificationsController],
  providers: [PortfolioService, HttpProxyService],
})
export class PortfolioModule {}
