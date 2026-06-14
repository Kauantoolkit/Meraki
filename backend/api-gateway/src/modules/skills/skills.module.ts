import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [SkillsController],
  providers: [SkillsService, HttpProxyService],
})
export class SkillsModule {}
