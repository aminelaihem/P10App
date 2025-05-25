import { Injectable } from '@nestjs/common';
import { SyncPilotesService } from './sync/sync.pilotes';
import { SyncTracksService } from './sync/sync.tracks';
import { SyncGPsService } from './sync/sync.gps';
import { SyncResultsService } from './sync/sync.results';

@Injectable()
export class F1DataService {
  constructor(
    private readonly pilotesService: SyncPilotesService,
    private readonly tracksService: SyncTracksService,
    private readonly gpsService: SyncGPsService,
    private readonly resultsService: SyncResultsService,
  ) {}

  async syncAllF1Data(year: string) {
    await this.pilotesService.syncPilotesEtEcuries(year);
    await this.tracksService.syncTracksFromMeetings(year);
    await this.gpsService.syncGPsFromMeetings(year);
  }

  async syncClassementByDate(date: string) {
    await this.resultsService.syncResultsFromDate(date);
  }
}
