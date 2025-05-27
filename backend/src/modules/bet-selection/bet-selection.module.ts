//  src/modules/bet-selection/bet-selection.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BetSelectionService } from './bet-selection.service';
import { BetSelectionResolver } from './bet-selection.resolver';

@Module({
  providers: [BetSelectionService, BetSelectionResolver, PrismaService],
})
export class BetSelectionModule {}