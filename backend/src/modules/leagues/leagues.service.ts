import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeagueInput } from './dto/create-league.input';
import { JoinLeagueInput } from './dto/join-league.input';

@Injectable()
export class LeaguesService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeague(input: CreateLeagueInput, userId: string) {
    if (input.avatarId) {
      const avatar = await this.prisma.avatar.findUnique({
        where: { id: input.avatarId },
      });
      if (!avatar) {
        throw new NotFoundException('Avatar non trouvé.');
      }
    }

    const league = await this.prisma.league.create({
      data: {
        name: input.name,
        private: input.private,
        sharedLink: input.private ? crypto.randomUUID() : null,
        avatarId: input.avatarId ?? null,
        users: {
          create: {
            role: 'admin',
            userId: userId
          },
        },
      },
      include: {
        users: true,
      },
    });

    return league;
  }

  async getUserLeagues(userId: string) {
    return this.prisma.league.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: true,
      },
    });
  }

  async joinLeague(input: JoinLeagueInput, userId: string) {
    const league = await this.prisma.league.findUnique({
      where: { sharedLink: input.sharedLink },
    });

    if (!league || league.private) {
      throw new NotFoundException('Ligue non trouvée ou privée.');
    }

    const alreadyJoined = await this.prisma.userLeague.findUnique({
      where: { leagueId_userId: { leagueId: league.id, userId } },
    });

    if (alreadyJoined) {
      return league;
    }

    await this.prisma.userLeague.create({
      data: {
        leagueId: league.id,
        userId,
        role: 'user',
      },
    });

    return league;
  }

  async leaveLeague(leagueId: string, userId: string) {
    const relation = await this.prisma.userLeague.findUnique({
      where: { leagueId_userId: { leagueId, userId } },
    });

    if (!relation) {
      throw new NotFoundException('Relation non trouvée.');
    }

    await this.prisma.userLeague.delete({
      where: { leagueId_userId: { leagueId, userId } },
    });

    return { success: true };
  }
}
