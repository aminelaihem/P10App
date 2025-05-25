import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface OpenF1Meeting {
  circuit_key: number;
  circuit_short_name: string;
  location: string;
  country_name: string;
  meeting_key: number;
  date_start: string;
}

@Injectable()
export class SyncTracksService {
  private readonly logger = new Logger(SyncTracksService.name);
  private readonly MEETINGS_URL = 'https://api.openf1.org/v1/meetings';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncTracksFromMeetings(year: string) {
    try {
      this.logger.log(`Fetching tracks from meetings for year ${year}...`);

      const { data }: { data: OpenF1Meeting[] } = await firstValueFrom(
        this.http.get(`${this.MEETINGS_URL}?year=${year}`),
      );

      const uniqueTracks = new Map<number, OpenF1Meeting>();

      for (const meeting of data) {
        if (!uniqueTracks.has(meeting.circuit_key)) {
          uniqueTracks.set(meeting.circuit_key, meeting);
        }
      }

      for (const track of uniqueTracks.values()) {
        const existing = await this.prisma.track.findUnique({
          where: { idApiTrack: track.circuit_key },
        });

        if (!existing) {
          await this.prisma.track.create({
            data: {
              idApiTrack: track.circuit_key,
              trackName: track.circuit_short_name,
              countryName: track.country_name,
              pictureCountryUrl: null,  
              pictureTrackUrl: null,   
            },
          });

          this.logger.log(`Track créé : ${track.circuit_short_name} (${track.country_name})`);
        }
      }

      this.logger.log('Synchronisation des tracks terminée.');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des tracks', error);
      throw error;
    }
  }
}
