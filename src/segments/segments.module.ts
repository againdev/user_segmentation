import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [SegmentsService, PrismaService],
  controllers: [SegmentsController],
  exports: [SegmentsService],
})
export class SegmentsModule {}
