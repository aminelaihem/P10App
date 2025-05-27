// 📁 src/modules/bet-selection/bet-selection.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBetInput } from './dto/create-bet.input';
import { UpdateBetInput } from './dto/update-bet.input';

const pointsByGap = [25, 18, 15, 12, 10, 8, 6, 4, 2];

@Injectable()
export class BetSelectionService {
  constructor(private readonly prisma: PrismaService) {}

  async createBet(userId: string, input: CreateBetInput) {
    const gp = await this.prisma.gP.findUnique({ where: { id: input.gpId } });
    if (!gp) throw new NotFoundException('GP introuvable');

    const now = new Date();
    const cutoff = new Date(gp.datetime.getTime() - 24 * 60 * 60 * 1000);
    if (now > cutoff) throw new BadRequestException('Les paris sont fermés pour ce GP.');

    const existing = await this.prisma.betSelectionResult.findFirst({
      where: { userId, gpId: input.gpId, leagueId: input.leagueId },
    });
    if (existing) throw new BadRequestException('Pari déjà effectué pour ce GP dans cette ligue.');

    return this.prisma.betSelectionResult.create({
      data: { userId, ...input },
    });
  }

  async updateBet(userId: string, input: UpdateBetInput) {
    const bet = await this.prisma.betSelectionResult.findFirst({
      where: { userId, gpId: input.gpId, leagueId: input.leagueId },
      include: { gp: true },
    });
    if (!bet) throw new NotFoundException('Pari non trouvé');

    const now = new Date();
    const cutoff = new Date(bet.gp.datetime.getTime() - 24 * 60 * 60 * 1000);
    if (now > cutoff) throw new BadRequestException('Les paris sont fermés pour ce GP.');

    return this.prisma.betSelectionResult.updateMany({
      where: { userId, gpId: input.gpId, leagueId: input.leagueId },
      data: input,
    });
  }

  async deleteBet(userId: string, gpId: string, leagueId: string) {
    const bet = await this.prisma.betSelectionResult.findFirst({
      where: { userId, gpId, leagueId },
      include: { gp: true },
    });
    if (!bet) throw new NotFoundException('Pari non trouvé');

    const now = new Date();
    const cutoff = new Date(bet.gp.datetime.getTime() - 24 * 60 * 60 * 1000);
    if (now > cutoff) throw new BadRequestException('Les paris sont fermés pour ce GP.');

    return this.prisma.betSelectionResult.deleteMany({
      where: { userId, gpId, leagueId },
    });
  }

  async getMyBet(userId: string, gpId: string, leagueId: string) {
    return this.prisma.betSelectionResult.findFirst({
      where: { userId, gpId, leagueId },
    });
  }

  async calculatePoints(gpId: string) {
    const bets = await this.prisma.betSelectionResult.findMany({
      where: { gpId },
    });

    const classement = await this.prisma.gPClassement.findMany({
      where: { gpId },
      include: { gpPilote: { include: { pilote: true } } },
    });

    for (const bet of bets) {
      let pointsP10 = 0;
      let pointsDNF = 0;

      if (bet.piloteP10Id) {
        const classementPilote = classement.find(c => c.gpPilote.piloteId === bet.piloteP10Id);
        if (classementPilote) {
          const ecart = Math.abs(classementPilote.position - 10);
          pointsP10 = pointsByGap[ecart] ?? 1;
        }
      }

      if (bet.piloteDNFId) {
        const isInClassement = classement.some(c => c.gpPilote.piloteId === bet.piloteDNFId);
        if (!isInClassement) pointsDNF = 10;
      }

      await this.prisma.betSelectionResult.updateMany({
        where: { userId: bet.userId, gpId: bet.gpId, leagueId: bet.leagueId },
        data: { pointsP10, pointsDNF },
      });
    }

    return true;
  }
}
