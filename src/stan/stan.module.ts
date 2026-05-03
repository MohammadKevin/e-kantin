import { Module } from '@nestjs/common';
import { StanService } from './stan.service';
import { StanController } from './stan.controller';

@Module({
  providers: [StanService],
  controllers: [StanController],
  exports: [StanService],
})
export class StanModule {}
