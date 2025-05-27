import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeagueInput } from './dto/create-league.input';
import { JoinLeagueInput } from './dto/join-league.input';

@Injectable()
export class LeaguesService implements OnModuleInit {
  private readonly MAIN_LEAGUE_NAME = 'Ligue Principale';
  // Caractères non ambigus (pas de 0/O, 1/I, etc.)
  private readonly ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  constructor(private readonly prisma: PrismaService) {}

  private generateSharedLink(): string {
    let result = '';
    const length = 8; // Longueur fixe de 8 caractères
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.ALLOWED_CHARS.length);
      result += this.ALLOWED_CHARS[randomIndex];
    }
    
    return result;
  }

  async onModuleInit() {
    await this.getOrCreateMainLeague();
  }

  private async getOrCreateMainLeague() {
    const mainLeague = await this.prisma.league.findFirst({
      where: { name: this.MAIN_LEAGUE_NAME },
    });

    if (!mainLeague) {
      return this.prisma.league.create({
        data: {
          name: this.MAIN_LEAGUE_NAME,
          private: false,
          sharedLink: this.generateSharedLink(),
        },
      });
    }

    return mainLeague;
  }

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
        sharedLink: input.private ? this.generateSharedLink() : null,
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
    let league;

    if (input.sharedLink) {
      league = await this.prisma.league.findUnique({
        where: { sharedLink: input.sharedLink },
        include: {
          users: true
        }
      });
    } else if (input.leagueId) {
      league = await this.prisma.league.findUnique({
        where: { id: input.leagueId },
        include: {
          users: true
        }
      });
    } else {
      throw new NotFoundException('Aucun identifiant de ligue fourni.');
    }

    if (!league) {
      throw new NotFoundException('Ligue non trouvée.');
    }

    // Si la ligue est privée, on ne peut la rejoindre qu'avec un sharedLink
    if (league.private && !input.sharedLink) {
      throw new ForbiddenException('Cette ligue est privée. Un lien de partage est requis.');
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

    // Récupérer la ligue mise à jour avec les utilisateurs
    return this.prisma.league.findUnique({
      where: { id: league.id },
      include: {
        users: true
      }
    });
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

  async addUserToMainLeague(userId: string) {
    const mainLeague = await this.getOrCreateMainLeague();
    
    const existingMembership = await this.prisma.userLeague.findUnique({
      where: { 
        leagueId_userId: {
          leagueId: mainLeague.id,
          userId: userId
        }
      },
    });

    if (!existingMembership) {
      await this.prisma.userLeague.create({
        data: {
          leagueId: mainLeague.id,
          userId: userId,
          role: 'user',
        },
      });
    }

    return mainLeague;
  }
}
