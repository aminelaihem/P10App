import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { LeaguesResolver } from './leagues.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [LeaguesService, LeaguesResolver, PrismaService],
  exports: [LeaguesService],
})
export class LeaguesModule {}
