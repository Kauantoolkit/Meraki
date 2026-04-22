import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [PortfolioController],
  providers: [PortfolioService, HttpProxyService],
})
export class PortfolioModule {}
