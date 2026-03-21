import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MilestonesController, KanbanController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [MilestonesController, KanbanController],
  providers: [MilestonesService, HttpProxyService],
})
export class MilestonesModule {}
