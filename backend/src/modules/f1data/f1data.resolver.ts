import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { F1DataService } from './f1data.service';
import { F1EntryService } from './f1-entry.service';
@Resolver()
export class F1DataResolver {
  constructor(
    private readonly f1DataService: F1DataService,
    private readonly f1EntryService: F1EntryService,
  ) {}

  @Mutation(() => Boolean)
  async syncF1Data(@Args('year') year: string) {
    await this.f1DataService.syncAllData(year);
    return true;
  }

  @Mutation(() => Boolean)
  async syncF1Pilotes(@Args('year') year: string) {
    await this.f1DataService.syncPilotes(year);
    return true;
  }

  @Mutation(() => Boolean)
  async syncF1Tracks(@Args('year') year: string) {
    await this.f1DataService.syncTracks(year);
    return true;
  }

  @Mutation(() => Boolean)
  async syncF1GPs(@Args('year') year: string) {
    await this.f1DataService.syncGPs(year);
    return true;
  }

  @Mutation(() => Boolean)
  async syncF1Results() {
    await this.f1DataService.syncResults();
    return true;
  }

  @Mutation(() => Boolean)
  async generateEntries(@Args('year') year: string) {
    await this.f1EntryService.generateEntriesForUpcomingGPs(year);
    return true;
  }
} 