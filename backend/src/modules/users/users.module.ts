import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaguesModule } from '../leagues/leagues.module';

@Module({
  imports: [LeaguesModule],
  providers: [UsersService, UsersResolver, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
