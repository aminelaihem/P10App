import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeagueInput } from './dto/create-league.input';
import { JoinLeagueInput } from './dto/join-league.input';
import { LeaveLeagueInput } from './dto/leave-league.input';

@Injectable()
export class LeaguesService {
  constructor(private prisma: PrismaService) {}

  async createLeague(input: CreateLeagueInput, userId: string) {
    const sharedLink = input.private ? Math.random().toString(36).substring(2, 10) : null;

    const league = await this.prisma.league.create({
      data: {
        name: input.name,
        private: input.private,
        sharedLink,
        users: {
          create: {
            userId,
            role: 'admin',
          },
        },
      },
      include: {
        users: {
          include: { user: true },
        },
      },
    });

    return league;
  }

  async joinLeague(input: JoinLeagueInput, userId: string) {
    const league = await this.prisma.league.findUnique({
      where: { sharedLink: input.sharedLink },
      include: { users: true },
    });

    if (!league || !league.active) throw new NotFoundException('League not found or inactive');

    const alreadyIn = league.users.find(u => u.userId === userId);
    if (alreadyIn) return league;

    await this.prisma.userLeague.create({
      data: {
        leagueId: league.id,
        userId,
        role: 'user',
      },
    });

    return this.prisma.league.findUnique({
      where: { id: league.id },
      include: { users: { include: { user: true } } },
    });
  }

  async leaveLeague(leagueId: string, userId: string) {
    const found = await this.prisma.userLeague.findUnique({
      where: { leagueId_userId: { leagueId, userId } },
    });

    if (!found) throw new NotFoundException('Not part of the league');

    await this.prisma.userLeague.delete({
      where: { leagueId_userId: { leagueId, userId } },
    });

    return true;
  }

  async getMyLeagues(userId: string) {
    const leagues = await this.prisma.league.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          include: { user: true },
        },
      },
    });

    return leagues;
  }
}
