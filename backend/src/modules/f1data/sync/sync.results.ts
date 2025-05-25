import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface ResultAPI {
  position: string;
  driver: string;
  team: string;
  number: string;
  scraped_at: string;
}

@Injectable()
export class SyncResultsService {
  private readonly logger = new Logger(SyncResultsService.name);
  private readonly API_PROF_URL = 'https://f1-api.demo.mds-paris.yt/api/gp/date';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncResultsFromDate(date: string) {
    try {
      this.logger.log(`Fetching results for date ${date}...`);

      const { data }: { data: ResultAPI[] } = await firstValueFrom(
        this.http.get(`${this.API_PROF_URL}?date=${date}`),
      );

      const gp = await this.prisma.gP.findFirst({
        where: {
          datetime: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lte: new Date(`${date}T23:59:59.999Z`),
          },
        },
      });

      if (!gp) {
        this.logger.warn(`Aucun GP trouvé pour la date ${date}`);
        return;
      }

      for (const result of data) {
        const pilote = await this.prisma.pilote.findFirst({
          where: {
            idApiPilote: parseInt(result.number),
          },
        });

        if (!pilote) {
          this.logger.warn(`Pilote inconnu : ${result.driver} (${result.number})`);
          continue;
        }

        const ecurie = await this.prisma.ecurie.findFirst({
          where: { name: result.team },
        });

        if (!ecurie) {
          this.logger.warn(`Écurie inconnue : ${result.team}`);
          continue;
        }

        // Vérifie si le GPPilote existe
        let gpPilote = await this.prisma.gPPilote.findFirst({
          where: {
            gpId: gp.id,
            piloteId: pilote.id,
            ecurieId: ecurie.id,
          },
        });

        if (!gpPilote) {
          gpPilote = await this.prisma.gPPilote.create({
            data: {
              gpId: gp.id,
              piloteId: pilote.id,
              ecurieId: ecurie.id,
            },
          });
          this.logger.log(`GPPilote ajouté pour ${pilote.name} (${result.team})`);
        }

        const position = parseInt(result.position);
        const isDNF = isNaN(position);

        // Crée ou met à jour le classement
        const existing = await this.prisma.gPClassement.findFirst({
          where: {
            gpId: gp.id,
            gpPiloteId: gpPilote.id,
          },
        });

        if (!existing) {
          await this.prisma.gPClassement.create({
            data: {
              gpId: gp.id,
              gpPiloteId: gpPilote.id,
              isDNF,
              position: isDNF ? 99 : position,
            },
          });

          this.logger.log(`Résultat ajouté : ${pilote.name} → ${isDNF ? 'DNF' : position}`);
        }
      }

      this.logger.log(` Résultats insérés pour le GP du ${date}`);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des résultats', error);
      throw error;
    }
  }
}
