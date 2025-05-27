/*import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { F1_API_CONFIG } from '../config/api.config';
import { OpenF1Meeting } from '../types/f1-api.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncTracksService {
  private readonly logger = new Logger(SyncTracksService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncTracksFromMeetings(year: string): Promise<void> {
    try {
      this.logger.log(`🔄 Synchronisation des circuits pour ${year}...`);
      
      const url = `${F1_API_CONFIG.OPENF1_BASE_URL}${F1_API_CONFIG.endpoints.meetings}?year=${year}`;
      const { data: meetings } = await firstValueFrom(
        this.httpService.get<OpenF1Meeting[]>(url),
      );

      for (const meeting of meetings) {
        const idApiTrack = parseInt(`${meeting.circuit_key}`);

        await this.prisma.track.upsert({
          where: {
            idApiTrack,
          },
          create: {
            idApiTrack,
            countryName: meeting.country_name,
            trackName: meeting.circuit_short_name,
            pictureCountryUrl: null,
            pictureTrackUrl: null,
          },
          update: {
            countryName: meeting.country_name,
            trackName: meeting.circuit_short_name,
          },
        });

        this.logger.log(`✅ Circuit synchronisé: ${meeting.circuit_short_name}`);
      }

      this.logger.log('✅ Synchronisation des circuits terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation des circuits:', error);
      throw error;
    }
  }
}
*/