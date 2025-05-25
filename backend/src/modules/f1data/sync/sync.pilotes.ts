import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface OpenF1Driver {
  driver_number: number;
  first_name: string;
  last_name: string;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name: string;
  team_colour?: string;
  meeting_key: number;
}

@Injectable()
export class SyncPilotesService {
  private readonly logger = new Logger(SyncPilotesService.name);
  private readonly API_URL = 'https://api.openf1.org/v1/drivers';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncPilotesEtEcuries(year: string) {
    try {
      this.logger.log(`Fetching drivers for year ${year}...`);

      const { data }: { data: OpenF1Driver[] } = await firstValueFrom(
        this.httpService.get(`${this.API_URL}?year=${year}`),
      );

      const uniqueDrivers = new Map<string, OpenF1Driver>();

      for (const driver of data) {
        const key = `${driver.driver_number}-${driver.team_name}`;
        if (!uniqueDrivers.has(key)) {
          uniqueDrivers.set(key, driver);
        }
      }

      for (const driver of uniqueDrivers.values()) {
        // 1. Handle Ecurie
        let ecurie = await this.prisma.ecurie.findFirst({
          where: { name: driver.team_name },
        });

        if (!ecurie) {
          ecurie = await this.prisma.ecurie.create({
            data: {
              idApiEcurie: driver.driver_number, // temporaire, car OpenF1 n'a pas d'id écurie stable
              name: driver.team_name,
              color: driver.team_colour || null,
            },
          });
          this.logger.log(`Créé écurie : ${ecurie.name}`);
        }

        // 2. Handle Pilote
        const piloteName = `${driver.first_name} ${driver.last_name}`;
        let pilote = await this.prisma.pilote.findUnique({
          where: { idApiPilote: driver.driver_number },
        });

        if (!pilote) {
          pilote = await this.prisma.pilote.create({
            data: {
              idApiPilote: driver.driver_number,
              name: piloteName,
              nameAcronym: driver.name_acronym,
              pictureUrl: driver.headshot_url || null,
            },
          });
          this.logger.log(`Créé pilote : ${pilote.name}`);
        }

        // 3. Handle PiloteEcurie (relation année)
        const existingRelation = await this.prisma.piloteEcurie.findFirst({
          where: {
            piloteId: pilote.id,
            ecurieId: ecurie.id,
            year,
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
          this.logger.log(`Lien ${pilote.name} → ${ecurie.name} (${year})`);
        }
      }

      this.logger.log(`Synchronisation des pilotes et écuries terminée`);
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des pilotes', error);
      throw error;
    }
  }
}
