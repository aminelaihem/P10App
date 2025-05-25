// src/modules/f1data/f1data.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { F1DataService } from './f1data.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SyncPilotesService } from './sync/sync.pilotes';
import { SyncTracksService } from './sync/sync.tracks';
import { SyncGPsService } from './sync/sync.gps';
import { SyncResultsService } from './sync/sync.results';
import { F1DataResolver } from './f1data.resolver';

@Module({
  imports: [HttpModule],
  providers: [
    F1DataService,
    PrismaService,
    SyncPilotesService,
    SyncTracksService,
    SyncGPsService,
    SyncResultsService,
    F1DataResolver,
  ],
  exports: [F1DataService],
})
export class F1DataModule {}
