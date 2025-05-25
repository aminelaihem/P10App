import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SyncPilotesService } from './sync/sync.pilotes';
import { SyncTracksService } from './sync/sync.tracks';
import { SyncGPsService } from './sync/sync.gps';
import { SyncResultsService } from './sync/sync.results';

@Injectable()
export class F1DataService implements OnModuleInit {
  private readonly logger = new Logger(F1DataService.name);

  constructor(
    private readonly pilotesService: SyncPilotesService,
    private readonly tracksService: SyncTracksService,
    private readonly gpsService: SyncGPsService,
    private readonly resultsService: SyncResultsService,
  ) {}

  async onModuleInit() {
    const year = '2025';
    const testResultDate = '2025-05-19'; // modifiable selon les GP passés connus

    this.logger.log(`Démarrage de la synchronisation F1 ${year}...`);

    try {
      await this.pilotesService.syncPilotesEtEcuries(year);
      await this.tracksService.syncTracksFromMeetings(year);
      await this.gpsService.syncGPsFromMeetings(year);
      await this.resultsService.syncResultsFromDate(testResultDate);

      this.logger.log(`Synchronisation F1 ${year} terminée avec succès.`);
    } catch (err) {
      this.logger.error('Erreur pendant la synchronisation F1', err);
    }
  }
}
