import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [BidsController],
  providers: [BidsService, HttpProxyService],
})
export class BidsModule {}
