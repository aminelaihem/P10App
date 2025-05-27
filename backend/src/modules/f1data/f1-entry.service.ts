// src/modules/f1data/f1-entry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class F1EntryService {
  private readonly logger = new Logger(F1EntryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateEntriesForUpcomingGPs(year: string): Promise<void> {
    this.logger.log(`✨ Génération des entrées GPPilote pour les GP futurs de ${year}...`);

    const today = new Date();

    // 1. Récupère tous les GPs à venir
    const upcomingGPs = await this.prisma.gP.findMany({
      where: {
        season: year,
        datetime: {
          gt: today,
        },
      },
    });

    if (upcomingGPs.length === 0) {
      this.logger.warn('Aucun GP à venir trouvé');
      return;
    }

    // 2. Récupère tous les pilotes actifs cette année (et leur écurie)
    const pilotesEcuries = await this.prisma.piloteEcurie.findMany({
      where: { year },
      include: {
        pilote: true,
        ecurie: true,
      },
    });

    if (pilotesEcuries.length === 0) {
      this.logger.warn(`Aucune relation Pilote-Ecurie pour ${year}`);
      return;
    }

    // 3. Pour chaque GP, on crée les entrées GPPilote si elles n'existent pas
    for (const gp of upcomingGPs) {
      for (const relation of pilotesEcuries) {
        const exists = await this.prisma.gPPilote.findFirst({
          where: {
            gpId: gp.id,
            piloteId: relation.piloteId,
            ecurieId: relation.ecurieId,
          },
        });

        if (!exists) {
          await this.prisma.gPPilote.create({
            data: {
              gpId: gp.id,
              piloteId: relation.piloteId,
              ecurieId: relation.ecurieId,
            },
          });
          this.logger.log(`+ Ajouté: ${relation.pilote.name} ➔ ${gp.id}`);
        }
      }
    }

    this.logger.log('✅ Entrées GPPilote générées pour les GPs à venir.');
  }
}
