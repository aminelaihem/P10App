// 📁 src/modules/bet-selection/bet-selection.resolver.ts
import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { BetSelectionResultModel } from './models/bet-selection.model';
import { BetSelectionService } from './bet-selection.service';
import { CreateBetInput } from './dto/create-bet.input';
import { UpdateBetInput } from './dto/update-bet.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => BetSelectionResultModel)
@UseGuards(GqlAuthGuard)
export class BetSelectionResolver {
  constructor(private readonly betService: BetSelectionService) {}

  @Mutation(() => BetSelectionResultModel)
  createBet(@Args('input') input: CreateBetInput, @Context('req') req: any) {
    return this.betService.createBet(req.user.userId, input);
  }

  @Mutation(() => BetSelectionResultModel)
  updateBet(@Args('input') input: UpdateBetInput, @Context('req') req: any) {
    return this.betService.updateBet(req.user.userId, input);
  }

  @Mutation(() => Boolean)
  deleteBet(@Args('gpId') gpId: string, @Args('leagueId') leagueId: string, @Context('req') req: any) {
    return this.betService.deleteBet(req.user.userId, gpId, leagueId);
  }

  @Query(() => BetSelectionResultModel, { nullable: true })
  myBetForGP(
    @Args('gpId') gpId: string,
    @Args('leagueId') leagueId: string,
    @Context('req') req: any,
  ) {
    return this.betService.getMyBet(req.user.userId, gpId, leagueId);
  }

  @Mutation(() => Boolean)
  calculateGPPoints(@Args('gpId') gpId: string) {
    return this.betService.calculatePoints(gpId);
  }
}
