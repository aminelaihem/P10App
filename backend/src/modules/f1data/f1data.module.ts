// src/modules/f1data/f1data.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { F1DataService } from './f1data.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SyncPilotesService } from './sync/sync.pilotes';
import { SyncTracksService } from './sync/sync.tracks';
import { SyncGPsService } from './sync/sync.gps';
import { SyncResultsService } from './sync/sync.results';
import { F1DataResolver } from './f1data.resolver';
import { F1DataSchedulerService } from './f1data-scheduler.service';
import { F1EntryService } from './f1-entry.service';
import { SyncCalendarService } from './sync/sync.calendar';
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot()
  ],
  providers: [
    PrismaService,
    F1EntryService,
    SyncPilotesService,
    SyncTracksService,
    SyncGPsService,
    SyncResultsService,
    F1DataService,
    F1DataResolver,
    F1DataSchedulerService,
    SyncCalendarService,
  ],
  exports: [F1DataService, F1EntryService, SyncCalendarService],
})
export class F1DataModule {}