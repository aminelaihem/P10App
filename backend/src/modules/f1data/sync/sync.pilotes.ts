import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { F1_API_CONFIG } from '../config/api.config';
import { OpenF1Driver } from '../types/f1-api.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncPilotesService {
  private readonly logger = new Logger(SyncPilotesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncPilotesEtEcuries(year: string): Promise<void> {
    try {
      this.logger.log(`🔄 Synchronisation des pilotes et écuries pour ${year}...`);
      
      const url = `${F1_API_CONFIG.OPENF1_BASE_URL}${F1_API_CONFIG.endpoints.drivers}`;
      const { data: drivers } = await firstValueFrom(
        this.httpService.get<OpenF1Driver[]>(url),
      );

      // Regrouper les pilotes par écurie
      const teamDrivers = this.groupDriversByTeam(drivers);

      // Synchroniser les écuries
      await this.syncEcuries(teamDrivers);

      // Synchroniser les pilotes
      await this.syncPilotes(drivers);

      // Créer les relations PiloteEcurie
      await this.syncPiloteEcurieRelations(teamDrivers, year);

      this.logger.log('✅ Synchronisation des pilotes et écuries terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation des pilotes et écuries:', error);
      throw error;
    }
  }

  private groupDriversByTeam(drivers: OpenF1Driver[]): Map<string, OpenF1Driver[]> {
    const teamDrivers = new Map<string, OpenF1Driver[]>();
    
    // Filtrer les pilotes avec des données d'équipe valides
    const validDrivers = drivers.filter(driver => {
      if (!driver.team_name) {
        this.logger.warn(`Pilote ignoré - Nom d'équipe manquant: ${driver.full_name}`);
        return false;
      }
      return true;
    });
    
    validDrivers.forEach(driver => {
      if (!teamDrivers.has(driver.team_name)) {
        teamDrivers.set(driver.team_name, []);
      }
      const teamDriversList = teamDrivers.get(driver.team_name);
      if (teamDriversList) {
        teamDriversList.push(driver);
      }
    });

    return teamDrivers;
  }

  private async syncEcuries(teamDrivers: Map<string, OpenF1Driver[]>): Promise<void> {
    for (const [teamName, drivers] of teamDrivers) {
      const driver = drivers[0]; // Prendre le premier pilote pour les infos d'écurie
      
      if (!teamName || !driver) {
        this.logger.warn(`Données d'équipe invalides: teamName=${teamName}, driver=${!!driver}`);
        continue;
      }
      
      await this.prisma.ecurie.upsert({
        where: {
          idApiEcurie: this.generateTeamId(teamName),
        },
        create: {
          idApiEcurie: this.generateTeamId(teamName),
          name: teamName,
          color: driver.team_colour,
        },
        update: {
          name: teamName,
          color: driver.team_colour,
        },
      });
    }
  }

  private async syncPilotes(drivers: OpenF1Driver[]): Promise<void> {
    for (const driver of drivers) {
      await this.prisma.pilote.upsert({
        where: {
          idApiPilote: driver.driver_number,
        },
        create: {
          idApiPilote: driver.driver_number,
          name: driver.full_name,
          nameAcronym: driver.name_acronym,
          pictureUrl: driver.headshot_url,
        },
        update: {
          name: driver.full_name,
          nameAcronym: driver.name_acronym,
          pictureUrl: driver.headshot_url,
        },
      });
    }
  }

  private async syncPiloteEcurieRelations(
    teamDrivers: Map<string, OpenF1Driver[]>,
    year: string,
  ): Promise<void> {
    for (const [teamName, drivers] of teamDrivers) {
      const ecurie = await this.prisma.ecurie.findUnique({
        where: { idApiEcurie: this.generateTeamId(teamName) },
      });

      if (!ecurie) {
        this.logger.warn(`Écurie non trouvée: ${teamName}`);
        continue;
      }

      for (const driver of drivers) {
        const pilote = await this.prisma.pilote.findUnique({
          where: { idApiPilote: driver.driver_number },
        });

        if (!pilote) {
          this.logger.warn(`Pilote non trouvé: ${driver.full_name}`);
          continue;
        }

        // Rechercher une relation existante
        const existingRelation = await this.prisma.piloteEcurie.findFirst({
          where: {
            AND: [
              { piloteId: pilote.id },
              { ecurieId: ecurie.id },
              { year },
            ],
          },
        });

        if (!existingRelation) {
          await this.prisma.piloteEcurie.create({
            data: {
              piloteId: pilote.id,
              ecurieId: ecurie.id,
              year,
            },
          });
        }
      }
    }
  }

  private generateTeamId(teamName: string): number {
    if (!teamName) {
      this.logger.error(`Nom d'équipe invalide: ${teamName}`);
      return 1; // Valeur par défaut sécurisée
    }
    // Générer un ID plus petit qui rentre dans un INT4 (max: 2147483647)
    return Math.abs(teamName.split('').reduce((acc, char) => {
      return (char.charCodeAt(0) + acc) % 2147483647;
    }, 0));
  }
}