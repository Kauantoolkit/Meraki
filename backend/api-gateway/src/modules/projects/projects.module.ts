import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { HttpProxyService } from '../../proxy/http-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, HttpProxyService],
})
export class ProjectsModule {}
