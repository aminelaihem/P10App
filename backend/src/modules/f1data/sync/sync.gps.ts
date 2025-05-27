/*import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { F1_API_CONFIG } from '../config/api.config';
import { OpenF1Meeting } from '../types/f1-api.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncGPsService {
  private readonly logger = new Logger(SyncGPsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncGPsFromMeetings(year: string): Promise<void> {
    try {
      this.logger.log(`🔄 Synchronisation des Grands Prix pour ${year}...`);
      
      const url = `${F1_API_CONFIG.OPENF1_BASE_URL}${F1_API_CONFIG.endpoints.meetings}?year=${year}`;
      const { data: meetings } = await firstValueFrom(
        this.httpService.get<OpenF1Meeting[]>(url),
      );

      for (const meeting of meetings) {
        const idApiTrack = parseInt(`${meeting.circuit_key}`);

        // 1. Recherche directe par idApiTrack
        let track = await this.prisma.track.findUnique({
          where: { idApiTrack },
        });

        // 2. Si pas trouvé, tentative par nom approximatif
        if (!track) {
          const tracks = await this.prisma.track.findMany();
          const possibleMatch = tracks.find((t) =>
            meeting.circuit_short_name
              .toLowerCase()
              .includes(t.trackName.toLowerCase()),
          );

          if (possibleMatch) {
            this.logger.warn(
              `🔁 Aucun match exact pour "${meeting.circuit_short_name}", mais trouvé "${possibleMatch.trackName}" par correspondance.`,
            );
            track = possibleMatch;
          }
        }

        if (!track) {
          this.logger.warn(`❌ Circuit introuvable pour GP: ${meeting.meeting_name}`);
          continue;
        }

        await this.prisma.gP.upsert({
          where: {
            idApiRace: meeting.meeting_key,
          },
          create: {
            idApiRace: meeting.meeting_key,
            season: year,
            datetime: new Date(meeting.date_start),
            trackId: track.id,
          },
          update: {
            season: year,
            datetime: new Date(meeting.date_start),
            trackId: track.id,
          },
        });

        this.logger.log(`✅ GP synchronisé: ${meeting.meeting_name}`);
      }

      this.logger.log('✅ Synchronisation des Grands Prix terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation des Grands Prix:', error);
      throw error;
    }
  }
}
*/