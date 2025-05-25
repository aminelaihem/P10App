import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface OpenF1Meeting {
  meeting_key: number;
  date_start: string;
  year: number;
  circuit_key: number;
  meeting_name: string;
  country_name: string;
}

@Injectable()
export class SyncGPsService {
  private readonly logger = new Logger(SyncGPsService.name);
  private readonly MEETINGS_URL = 'https://api.openf1.org/v1/meetings';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncGPsFromMeetings(year: string) {
    try {
      this.logger.log(`Fetching GPs from meetings for year ${year}...`);

      const { data }: { data: OpenF1Meeting[] } = await firstValueFrom(
        this.http.get(`${this.MEETINGS_URL}?year=${year}`),
      );

      for (const meeting of data) {
        const track = await this.prisma.track.findUnique({
          where: { idApiTrack: meeting.circuit_key },
        });

        if (!track) {
          this.logger.warn(
            `Track non trouvé pour circuit_key ${meeting.circuit_key}. GP ignoré.`,
          );
          continue;
        }

        const existing = await this.prisma.gP.findUnique({
          where: { idApiRace: meeting.meeting_key },
        });

        if (!existing) {
          await this.prisma.gP.create({
            data: {
              idApiRace: meeting.meeting_key,
              season: year,
              datetime: new Date(meeting.date_start),
              trackId: track.id,
            },
          });

          this.logger.log(`GP créé : ${meeting.meeting_name} (${meeting.date_start})`);
        }
      }

      this.logger.log('Synchronisation des GP terminée.');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des GP', error);
      throw error;
    }
  }
}
