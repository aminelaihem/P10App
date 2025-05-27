// src/modules/f1data/f1data.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SyncPilotesService } from './sync/sync.pilotes';
import { SyncTracksService } from './sync/sync.tracks';
import { SyncGPsService } from './sync/sync.gps';
import { SyncResultsService } from './sync/sync.results';
import { F1EntryService } from './f1-entry.service';
import { SyncCalendarService } from './sync/sync.calendar';
@Injectable()
export class F1DataService implements OnModuleInit {
  private readonly logger = new Logger(F1DataService.name);

  constructor(
    private readonly calendarService: SyncCalendarService,
    private readonly pilotesService: SyncPilotesService,
    private readonly tracksService: SyncTracksService,
    private readonly gpsService: SyncGPsService,
    private readonly resultsService: SyncResultsService,
    private readonly entryService: F1EntryService,
  ) {}

  async onModuleInit() {
    const year = '2025';
    await this.syncAllData(year);
  }

  async syncAllData(year: string) {
    this.logger.log(`Démarrage de la synchronisation F1 ${year}...`);

    try {
      await this.calendarService.syncGPsFromJolpica(year);
      await this.pilotesService.syncPilotesEtEcuries(year);
      await this.tracksService.syncTracksFromMeetings(year);
      await this.gpsService.syncGPsFromMeetings(year);
      await this.entryService.generateEntriesForUpcomingGPs(year); // 👈
      await this.resultsService.syncAllAvailableResults();

      this.logger.log(`✅ Synchronisation F1 ${year} terminée avec succès.`);
    } catch (err) {
      this.logger.error('❌Erreur pendant la synchronisation F1', err);
      throw err;
    }
  }

  async syncPilotes(year: string) {
    return this.pilotesService.syncPilotesEtEcuries(year);
  }

  async syncTracks(year: string) {
    return this.tracksService.syncTracksFromMeetings(year);
  }

  async syncGPs(year: string) {
    return this.gpsService.syncGPsFromMeetings(year);
  }

  async syncResults() {
    return this.resultsService.syncAllAvailableResults();
  }
}