import { Test, TestingModule } from '@nestjs/testing';
import { LeaguesService } from './leagues.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateLeagueInput } from './dto/create-league.input';
import { JoinLeagueInput } from './dto/join-league.input';

const mockPrisma = {
  league: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  userLeague: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  avatar: {
    findUnique: jest.fn(),
  },
};

describe('LeaguesService', () => {
  let service: LeaguesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaguesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LeaguesService>(LeaguesService);
    jest.clearAllMocks();
  });

  describe('createLeague', () => {
    it('should create a public league (sharedLink = null)', async () => {
      const input: CreateLeagueInput = { name: 'Public League', private: false };
      const userId = 'user-1';

      mockPrisma.league.create.mockResolvedValue({ id: 'league-1', ...input });

      const result = await service.createLeague(input, userId);
      expect(result).toBeDefined();
      expect(mockPrisma.league.create).toHaveBeenCalled();
    });

    it('should create a private league (sharedLink generated)', async () => {
      const input: CreateLeagueInput = { name: 'Private League', private: true };
      const userId = 'user-1';
      mockPrisma.league.create.mockResolvedValue({ id: 'league-2', ...input });

      const result = await service.createLeague(input, userId);
      expect(result).toBeDefined();
      expect(mockPrisma.league.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if avatarId not found', async () => {
      const input: CreateLeagueInput = {
        name: 'With Avatar',
        private: false,
        avatarId: 'invalid-avatar-id',
      };
      const userId = 'user-1';

      mockPrisma.avatar.findUnique.mockResolvedValue(null);

      await expect(service.createLeague(input, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserLeagues', () => {
    it('should return leagues for user', async () => {
      mockPrisma.league.findMany.mockResolvedValue([{ id: 'league-1' }]);
      const result = await service.getUserLeagues('user-1');
      expect(result).toEqual([{ id: 'league-1' }]);
    });
  });

  describe('joinLeague', () => {
    it('should join public league with sharedLink', async () => {
      const input: JoinLeagueInput = { sharedLink: 'link123' };
      const userId = 'user-1';

      mockPrisma.league.findUnique.mockResolvedValue({ id: 'league-1', private: false });
      mockPrisma.userLeague.findUnique.mockResolvedValue(null);
      mockPrisma.userLeague.create.mockResolvedValue({});
      mockPrisma.league.findUnique.mockResolvedValue({ id: 'league-1', users: [] });

      const result = await service.joinLeague(input, userId);
      expect(result.id).toEqual('league-1');
    });

    it('should return league if already joined', async () => {
      const input: JoinLeagueInput = { sharedLink: 'link123' };
      const userId = 'user-1';

      mockPrisma.league.findUnique.mockResolvedValue({ id: 'league-1', private: false });
      mockPrisma.userLeague.findUnique.mockResolvedValue(true);

      const result = await service.joinLeague(input, userId);
      expect(result.id).toEqual('league-1');
    });

    it('should throw NotFoundException if league not found', async () => {
      mockPrisma.league.findUnique.mockResolvedValue(null);
      await expect(service.joinLeague({ sharedLink: 'invalid' }, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if league is private and no sharedLink', async () => {
      mockPrisma.league.findUnique.mockResolvedValue({ id: 'league-1', private: true });
      await expect(service.joinLeague({ leagueId: 'league-1' }, 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if no id provided', async () => {
      await expect(service.joinLeague({}, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('leaveLeague', () => {
    it('should delete relation if exists', async () => {
      mockPrisma.userLeague.findUnique.mockResolvedValue({});
      mockPrisma.userLeague.delete.mockResolvedValue({});

      const result = await service.leaveLeague('league-1', 'user-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if relation not found', async () => {
      mockPrisma.userLeague.findUnique.mockResolvedValue(null);
      await expect(service.leaveLeague('league-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
