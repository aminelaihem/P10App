import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface Track {
  id: string;
  idApiTrack: number;
  trackName: string;
  countryName: string;
  pictureCountryUrl: string | null;
  pictureTrackUrl: string | null;
}

@Injectable()
export class SyncCalendarService {
  private readonly logger = new Logger(SyncCalendarService.name);
  private readonly API_URL = 'https://api.jolpi.ca/ergast/f1';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateTrackId(circuitName: string): number {
    // Générer un nombre unique basé sur le nom du circuit
    return parseInt(Date.now().toString().slice(-8));
  }

  async syncGPsFromJolpica(year: string): Promise<void> {
    const url = `${this.API_URL}/${year}.json`;
    try {
      this.logger.log(`✨ Import du calendrier F1 ${year} via Jolpica...`);

      const { data } = await firstValueFrom(this.httpService.get(url));
      const races = data.MRData?.RaceTable?.Races;
      if (!races || races.length === 0) {
        this.logger.warn("⚠️ Aucune course trouvée dans la réponse de l'API");
        return;
      }

      const allTracks = await this.prisma.track.findMany();

      for (const race of races) {
        const circuit = race.Circuit;
        const circuitName = circuit.circuitName.toLowerCase();

        // Essayer de trouver un track existant via approximation du nom
        const matchingTrack = allTracks.find((t) =>
          t.trackName.toLowerCase().includes(circuitName) ||
          circuitName.includes(t.trackName.toLowerCase())
        );

        let trackId: string;

        if (matchingTrack) {
          this.logger.log(`🔗 Circuit existant trouvé : ${matchingTrack.trackName}`);
          trackId = matchingTrack.id;
        } else {
          // Sinon on crée un nouveau track avec un idApiTrack personnalisé
          const generatedIdApiTrack = this.generateTrackId(circuit.circuitName);

          const newTrack = (await this.prisma.track.create({
            data: {
              idApiTrack: generatedIdApiTrack,
              trackName: circuit.circuitName,
              countryName: circuit.Location.country,
              pictureCountryUrl: null,
              pictureTrackUrl: null,
            },
          })) as unknown as Track;

          this.logger.log(`➕ Nouveau circuit inséré : ${circuit.circuitName}`);
          trackId = newTrack.id;
        }

        // Date + heure du GP
        const gpDateTime = race.time
          ? new Date(`${race.date}T${race.time}`)
          : new Date(race.date);

        const idApiRace = parseInt(`${year}${race.round}`);

        await this.prisma.gP.upsert({
          where: { idApiRace },
          create: {
            idApiRace,
            season: year,
            datetime: gpDateTime,
            trackId,
          },
          update: {
            season: year,
            datetime: gpDateTime,
            trackId,
          },
        });

        this.logger.log(`✅ GP ajouté : ${race.raceName} (${race.round})`);
      }

      this.logger.log(`✅ ${races.length} Grands Prix synchronisés pour la saison ${year}`);
    } catch (err) {
      this.logger.error('❌ Erreur lors de la synchronisation avec Jolpica', err);
      throw err;
    }
  }
}
