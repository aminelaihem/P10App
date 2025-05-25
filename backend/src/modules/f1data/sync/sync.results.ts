import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { F1_API_CONFIG } from '../config/api.config';
import { F1Result } from '../types/f1-api.types';
import { firstValueFrom } from 'rxjs';

interface GPDate {
  date: string;
}

@Injectable()
export class SyncResultsService {
  private readonly logger = new Logger(SyncResultsService.name);
  private availableDates: string[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private async fetchAvailableDates(): Promise<string[]> {
    try {
      const url = `${F1_API_CONFIG.RESULTS_API_BASE_URL}/gp/dates`;
      const { data: dates } = await firstValueFrom(
        this.httpService.get<GPDate[]>(url, {
          headers: {
            Authorization: `Bearer ${F1_API_CONFIG.RESULTS_API_TOKEN}`,
          },
        }),
      );

      this.availableDates = dates.map(d => d.date);
      return this.availableDates;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des dates disponibles:', error);
      return [];
    }
  }

  async syncAllAvailableResults(): Promise<void> {
    try {
      // Récupérer toutes les dates disponibles
      const dates = await this.fetchAvailableDates();
      
      if (dates.length === 0) {
        this.logger.warn('Aucune date de résultats disponible');
        return;
      }

      this.logger.log(`🔄 Synchronisation des résultats pour ${dates.length} courses...`);

      // Synchroniser les résultats pour chaque date
      for (const date of dates) {
        await this.syncResultsFromDate(date);
      }

      this.logger.log('✅ Synchronisation de tous les résultats terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation des résultats:', error);
      throw error;
    }
  }

  async syncResultsFromDate(raceDate: string): Promise<void> {
    try {
      // Vérifier si la date est disponible
      if (!this.availableDates.includes(raceDate)) {
        const dates = await this.fetchAvailableDates();
        if (!dates.includes(raceDate)) {
          this.logger.warn(`⚠️ Pas de résultats disponibles pour la date ${raceDate}`);
          return;
        }
      }

      this.logger.log(`🔄 Synchronisation des résultats pour la course du ${raceDate}...`);

      // Trouver le GP correspondant à la date
      const gp = await this.prisma.gP.findFirst({
        where: {
          datetime: {
            // La date de l'API est 3 jours après la date réelle du GP
            gte: new Date(new Date(raceDate).setDate(new Date(raceDate).getDate() - 4)), // -4 pour avoir la date du GP
            lte: new Date(new Date(raceDate).setDate(new Date(raceDate).getDate() - 2)), // -2 pour avoir une marge
          },
        },
        include: {
          track: true,
        },
      });

      if (!gp) {
        this.logger.warn(`Aucun GP trouvé pour la date ${raceDate}`);
        return;
      }

      // Récupérer les résultats depuis l'API
      const url = `${F1_API_CONFIG.RESULTS_API_BASE_URL}/gp/date?date=${raceDate}`;
      const { data: results } = await firstValueFrom(
        this.httpService.get<F1Result[]>(url, {
          headers: {
            Authorization: `Bearer ${F1_API_CONFIG.RESULTS_API_TOKEN}`,
          },
        }),
      );

      if (!results || results.length === 0) {
        this.logger.warn(`Aucun résultat disponible pour la date ${raceDate}`);
        return;
      }

      // Pour chaque résultat
      for (const result of results) {
        // Trouver le pilote par son numéro
        const pilote = await this.prisma.pilote.findFirst({
          where: {
            idApiPilote: parseInt(result.number),
          },
        });

        if (!pilote) {
          this.logger.warn(`Pilote non trouvé pour le numéro: ${result.number} (${result.driver})`);
          continue;
        }

        // Trouver l'écurie du pilote pour ce GP
        const piloteEcurie = await this.prisma.piloteEcurie.findFirst({
          where: {
            piloteId: pilote.id,
            year: gp.season,
          },
        });

        if (!piloteEcurie) {
          this.logger.warn(`Relation Pilote-Ecurie non trouvée pour ${pilote.name} en ${gp.season}`);
          continue;
        }

        // Créer ou mettre à jour GPPilote
        let gpPilote = await this.prisma.gPPilote.findFirst({
          where: {
            gpId: gp.id,
            piloteId: pilote.id,
            ecurieId: piloteEcurie.ecurieId,
          },
        });

        if (!gpPilote) {
          gpPilote = await this.prisma.gPPilote.create({
            data: {
              gpId: gp.id,
              piloteId: pilote.id,
              ecurieId: piloteEcurie.ecurieId,
            },
          });
        }

        // Déterminer si c'est un DNF (position "DNF" ou "DNS" ou "DSQ")
        const isDNF = ["DNF", "DNS", "DSQ"].includes(result.position.toUpperCase());
        const position = isDNF ? 0 : parseInt(result.position);

        if (isNaN(position)) {
          this.logger.warn(`Position invalide pour ${pilote.name}: ${result.position}`);
          continue;
        }

        // Créer ou mettre à jour le classement
        const existingClassement = await this.prisma.gPClassement.findFirst({
          where: {
            gpId: gp.id,
            gpPiloteId: gpPilote.id,
          },
        });

        if (existingClassement) {
          await this.prisma.gPClassement.update({
            where: {
              id: existingClassement.id,
            },
            data: {
              position,
              isDNF,
            },
          });
        } else {
          await this.prisma.gPClassement.create({
            data: {
              position,
              isDNF,
              gp: {
                connect: {
                  id: gp.id
                }
              },
              gpPilote: {
                connect: {
                  id: gpPilote.id
                }
              }
            },
          });
        }

        this.logger.log(`✅ Résultat synchronisé pour ${pilote.name}: ${result.position}`);
      }

      this.logger.log('✅ Synchronisation des résultats terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation des résultats:', error);
      throw error;
    }
  }
}