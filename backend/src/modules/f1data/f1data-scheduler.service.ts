import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { F1DataService } from './f1data.service';

@Injectable()
export class F1DataSchedulerService {
  private readonly logger = new Logger(F1DataSchedulerService.name);
  private readonly year = '2025';

  constructor(private readonly f1DataService: F1DataService) {}

  // Synchronisation des résultats toutes les heures du lundi au jeudi
  @Cron('0 * * * 1-4', {
    name: 'syncResults',
    timeZone: 'Europe/Paris'
  })
  async handleResultsSync() {
    this.logger.log('Synchronisation automatique des résultats...');
    try {
      await this.f1DataService.syncResults();
      this.logger.log('Synchronisation des résultats terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des résultats:', error);
    }
  }

  // Synchronisation des pilotes et écuries une fois par semaine (lundi à 3h du matin)
  @Cron('0 3 * * 1', {
    name: 'syncPilotes',
    timeZone: 'Europe/Paris'
  })
  async handlePilotesSync() {
    this.logger.log('Synchronisation automatique des pilotes et écuries...');
    try {
      await this.f1DataService.syncPilotes(this.year);
      this.logger.log('Synchronisation des pilotes terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des pilotes:', error);
    }
  }

  // Synchronisation des circuits une fois par semaine (lundi à 3h30 du matin)
  /*
  @Cron('30 3 * * 1', {
    name: 'syncTracks',
    timeZone: 'Europe/Paris'
  })
  async handleTracksSync() {
    this.logger.log('Synchronisation automatique des circuits...');
    try {
      await this.f1DataService.syncTracks(this.year);
      this.logger.log('Synchronisation des circuits terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des circuits:', error);
    }
  }*/

  // Synchronisation des GPs une fois par jour (à 4h du matin)
  /*
  @Cron('0 4 * * *', {
    name: 'syncGPs',
    timeZone: 'Europe/Paris'
  })
  async handleGPsSync() {
    this.logger.log('Synchronisation automatique des GPs...');
    try {
      await this.f1DataService.syncGPs(this.year);
      this.logger.log('Synchronisation des GPs terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des GPs:', error);
    }
  }*/

  // Synchronisation complète une fois par jour (à 5h du matin)
  @Cron('0 5 * * *', {
    name: 'syncAll',
    timeZone: 'Europe/Paris'
  })
  async handleCompleteSync() {
    this.logger.log('Synchronisation automatique complète...');
    try {
      await this.f1DataService.syncAllData(this.year);
      this.logger.log('Synchronisation complète terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation complète:', error);
    }
  }
} 