import { Module } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { SiswaController } from './siswa.controller';

@Module({
  providers: [SiswaService],
  controllers: [SiswaController]
})
export class SiswaModule {}
